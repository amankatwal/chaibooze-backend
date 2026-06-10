import { pool } from "../db.js";
import {v2 as cloudinary} from "cloudinary";
import { allProductsQuery, getProductById, getProductsByCategoryQuery, productCreate, productDel, productUpdate, sortByLatest, sortByRating, topSellingProductQuery, verifyProductById } from "../queries/query.js";

export const createProduct = async(req,res) =>{
    const {name , description, stock, category, price} = req.body;
    const createdBy = req.user.id;
    try {
        if(!createdBy) {
            res.status(401).json({success: false, message: "Session Expired, Please Login again"});
        }
       if(!name || !description || !stock || !category || !price){
       return res.status(400).json({success: false, message : "Please provode all the details"});
       } 
       let uploadedImages = [];

       if (req.files && req.files.images){
        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
for(const image of images){
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder : "Chaibooze_menu",
          width: 1000,
          crop: "scale"
        })

        
            uploadedImages.push({
                url: result.secure_url,
                public_id : result.public_id
            })
        }
       }
       const product = await pool.query(productCreate, [name , description,stock, category, price, createdBy,JSON.stringify(uploadedImages)]);
       return res.status(200).json({success: true, message: `${product.length} item(s) have been added successfully in the menu`, data: product})
    } catch (err) {
        console.error(err);
        
    }
};

export const fetchAllProducts = async(req,res)=>{
   const {category, price, search, stock, ratings, sort} = req.query;
   const page = parseInt(req.query.page) || 1;
   const limit = 8;
   const offset = (page-1)*limit;
   let conditions = [];
   let index = 1;
   let values = [];
   let handlePage = {};
    let orderBy = 'ORDER BY p.created_at DESC '

   try {
    if(stock === "available"){
      conditions.push(`stock > 5`);
    }else if(stock ==="limited"){
        conditions.push(`stock >0 AND stock <=5`)
    }else if(stock === "not-available"){
        conditions.push("stock = 0");
    }

    if(price){
        const [minPrice, maxPrice]= price.split(`-`);
        if(minPrice && maxPrice){
            conditions.push(`price BETWEEN $${index} AND $${index+1}`);
            values.push(minPrice,maxPrice);
            index+=2
        }
    }

if (sort){
   
      if(sort === "price-low-high"){
        orderBy = "ORDER BY p.price ASC"
      }
      if(sort === "price-high-low"){
        orderBy =`ORDER BY p.price DESC`
      }
      if(sort === "top-rated-priducts"){
        conditions.push(`ratings >= $${index}`);
        values.push(4.5);
        index++;
      }
}

    if(search){
        conditions.push(`(name ILIKE $${index} OR description ILIKE $${index})`);
        values.push(`%${search}%`);
        index++
    }

    if(category){
        conditions.push(`category ILIKE $${index}`);
        values.push(`%${category}%`);
        index++;
    }

    if(ratings){
        conditions.push(`ratings >= $${index}`);
        values.push(ratings);
        index++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const totalProducts = await pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, values);
    const totalProductsCount = parseInt(totalProducts[0].count);

handlePage.limit = (`${index}`);
values.push(limit);
index++;

handlePage.offset = (`${index}`);
values.push(offset);
index++;

const query = `SELECT p.*, COUNT(r.*) AS review_count FROM products p 
LEFT JOIN reviews r ON p.id = r.product_id 
${whereClause} 
GROUP BY p.id 
${orderBy}
LIMIT $${handlePage.limit} 
OFFSET $${handlePage.offset}`;

const result = await pool.query(query, values);

const resultByRating = await pool.query(sortByRating);

const topMostOrderedProducts = await pool.query(topSellingProductQuery);

const resultByLatest = await pool.query(sortByLatest);

const allProducts = await pool.query(allProductsQuery);

return res.status(200).json({totalProductsCount, products: result, sortByRating: resultByRating, sortByLatest: resultByLatest, topMostOrderedProducts, allProducts})
    
   } catch (err) {
    console.error(err);
    
   }
}

export const updateProduct = async(req,res)=>{
const {id} = req.params;
const {name , description, stock, category, price} = req.body;

try {
    const product = await pool.query(getProductById, [id])
    if(!product.length){
     return   res.status(404).json({success:false, message: "Product not found"})
    }
    if(!name || !description || !stock || !category || !price){
       return res.status(400).json({success: false, message : "Please provode all the details"});
       } 
       const newUpdatedProduct = await pool.query(productUpdate, [name , description, stock, category, price, id]);
       res.status(200).json({success : true, message : `${newUpdatedProduct[0].name} have been updated successfully`, data: newUpdatedProduct});
   
} catch (err) {
    console.error(err);
    
}
};

export const fetchProductById = async(req,res) =>{
    const {id} = req.params;
    try {
        const productVerify = await pool.query(verifyProductById, [id]);
        if(productVerify.length===0){
            return res.status(404).json({success: false, message: "No product found"});
        }
        const product = await pool.query(getProductById, [id]);
        res.status(200).json({success: true, data: product[0]});
    } catch (err) {
        console.error(err);
        
    }
}
  
export const deleteProductById = async(req,res)=>{
    const {id} = req.params;
    try {
        const productVerify = await pool.query(verifyProductById, [id]);
        if(!productVerify.length){
            return res.status(404).json({success: false, message: "No product found"});
        }
        const deletedProduct = await pool.query(productDel, [id]);
        res.status(200).json({success: true, message: `${deletedProduct[0].name} have been deleted successfully`});
    } catch (err) {
        console.error(err);
        
    }
}

export const getProductsByCategory = async(req,res)=>{
    const {category} = `${req.params}`;
    try {
        const productsByCategory = await pool.query(getProductsByCategoryQuery,[category]);
        
        return res.status(200).json({success: true, products: productsByCategory})
    } catch (err) {
        console.log(err);
    }
    
}



