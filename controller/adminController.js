import { pool } from "../db.js";
import { checkAllUsers, deleteUserById, lowRatedProductQuery, lowSellingProductQuery, lowStockProductQuery, monthlySalesQuery, newUsersQuery, orderStatusQuery, topRatedProductsQuery, topSellingProductQuery, totalRevenueByDate, totalRevenueByDates, totalRevenueQuery, userCheckById, userCountCheck } from "../queries/query.js";

export const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
        const numberOfUsers = await pool.query(userCountCheck, ["user"]);
        const userRes = await pool.query(checkAllUsers, ["user", limit, offset]);
        res.status(200).json({ success: true, message: `User count fetched Successfully`, count: numberOfUsers[0].count, data: userRes });
    } catch (err) {
        console.error(err);

    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const userRes = await pool.query(userCheckById, [id]);
        if (userRes.length === 0) {
            res.status(404).json({ success: false, message: `User Not found` });

        }
        if (userRes.length > 0) {
            res.status(200).json({ success: true, message: `${userRes[0].name} found successfully`, data: userRes[0] });
        }
    } catch (err) {
        console.error(err);
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const userRes = await pool.query(deleteUserById, [id]);
        if (userRes.length === 0) {
            res.status(404).json({ success: false, message: `User Not found` });

        }
        res.status(200).json({ success: true, message: `${userRes[0].name} have been deleted successfully` });
    } catch (err) {
        console.error(err);
    }
}

export const adminDashboard = async (req,res) => {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split("T")[0];
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    try {
        const totalRevenueRes = await pool.query(totalRevenueQuery);
        const totalRevenue = parseFloat(totalRevenueRes[0].total_revenue) || 0;

        const totalRevenueTodayRes = await pool.query(totalRevenueByDate, [todayDate]);
        const totalRevenueToday = parseFloat(totalRevenueTodayRes[0].total_revenue) || 0;

        const totalRevenueYesterdayRes = await pool.query(totalRevenueByDate, [yesterdayDate]);
        const totalRevenueYesterday = parseFloat(totalRevenueYesterdayRes[0].total_revenue) || 0;

        const monthlyRevenueRes = await pool.query(monthlySalesQuery);
        const monthlySales = monthlyRevenueRes.map(row => ({
            month: row.month,
            sales: parseFloat(row.total_sales)
        }))

        const totalRevenueByCurrentMonthRes = await pool.query(totalRevenueByDate, [currentMonth]);
        const totalRevenueByCurrentMonth = parseFloat(totalRevenueByCurrentMonthRes[0].total_revenue) || 0;

        const totalRevenueByPreviousMonthRes = await pool.query(totalRevenueByDates, [previousMonthStart, previousMonthEnd]);
        const totalRevenueByPreviousMonth = parseFloat(totalRevenueByPreviousMonthRes[0].total_revenue) || 0;

        const usersCountRes = await pool.query(userCountCheck, ["user"]);
        const userCount = usersCountRes[0].count || 0;

        const newUsers = await pool.query(newUsersQuery, [currentMonth, "user"]) || 0;

        const orderStatusCountRes = await pool.query(orderStatusQuery);

        const orderStatusCount = {
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        }

        orderStatusCountRes.forEach((row) => {
            orderStatusCount[row.order_status] = parseInt(row.count);
        });
        const topSellingProduct = await pool.query(topSellingProductQuery);
        const lowSellingProduct = await pool.query(lowSellingProductQuery);
        const lowStockProduct = await pool.query(lowStockProductQuery);
        const topRatedProducts = await pool.query(topRatedProductsQuery);
        const lowRatedProducts = await pool.query(lowRatedProductQuery);
        let revenueGrowth = "0%";

        if(totalRevenueByPreviousMonth > 0){
          const growthRate =  ((totalRevenueByCurrentMonth - totalRevenueByPreviousMonth)/totalRevenueByPreviousMonth)*100;
            revenueGrowth = `${growthRate >=0? "+" : ""}${growthRate.toFixed(2)}%`
        }
         

        res.status(200).json({ success: true, message: "Dashboard Stats Fetched Successfully", totalRevenue, totalRevenueToday, totalRevenueYesterday, monthlySales, totalRevenueByCurrentMonth, totalRevenueByPreviousMonth, userCount, newUsers, orderStatusCount, topSellingProduct, lowSellingProduct, lowStockProduct,topRatedProducts, lowRatedProducts, revenueGrowth  })


    } catch (err) {
console.error(err);

    }

}