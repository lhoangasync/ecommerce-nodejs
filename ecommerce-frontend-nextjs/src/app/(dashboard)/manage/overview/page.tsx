"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Clock,
  Truck,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  pendingOrders: number;
  undeliveredOrders: number;
  paidOrders: number;
  completedOrders: number;
}

interface ChartDataItem {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
}

interface ProductStat {
  [key: string]: string | number;
  name: string;
  quantity: number;
  revenue: number;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image?: string;
  variant_id: string;
  variant_shade_color?: string;
  variant_volume_size?: string;
  variant_sku: string;
  variant_image?: string;
  quantity: number;
  unit_price: number;
  original_price?: number;
  subtotal: number;
}

interface Order {
  _id: string;
  user_id: string;
  order_code: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount_amount?: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: "cod" | "momo" | "vnpay" | "bank_transfer";
  created_at: string;
  updated_at: string;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    undeliveredOrders: 0,
    paidOrders: 0,
    completedOrders: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate profit for a single order
  const calculateOrderProfit = (order: Order): number => {
    const discount = order.discount_amount || 0;
    const profit = (order.total_amount - order.shipping_fee - discount) * 0.5;
    return profit;
  };

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Import the API functions
        const { getAllOrders } = await import("@/api/order.api");

        // Fetch all orders (no filter)
        const allOrdersResponse = await getAllOrders({});
        const allOrdersData =
          (allOrdersResponse?.data as any)?.orders ||
          allOrdersResponse?.data?.items ||
          [];

        if (allOrdersData.length > 0) {
          const allOrdersList: Order[] = allOrdersData;
          // Filter orders that are paid (regardless of delivery status)
          const paidOrdersList = allOrdersList.filter(
            (o) => o.payment_status === "paid"
          );

          // Calculate statistics from PAID orders
          const revenue = paidOrdersList.reduce(
            (sum, o) => sum + o.total_amount,
            0
          );
          const totalProfit = paidOrdersList.reduce(
            (sum, o) => sum + calculateOrderProfit(o),
            0
          );

          // Count orders by status
          const pendingOrders = allOrdersList.filter(
            (o) => o.status === "pending"
          ).length;

          const undeliveredOrders = allOrdersList.filter(
            (o) => o.status !== "delivered" && o.status !== "cancelled"
          ).length;

          const paidOrders = paidOrdersList.length;
          const completedOrders = allOrdersList.filter(
            (o) =>
              o.status === "delivered" &&
              (o.payment_status === "paid" || o.payment_method === "cod")
          ).length;

          setStats({
            totalRevenue: revenue,
            totalProfit: totalProfit,
            totalOrders: paidOrdersList.length,
            avgOrderValue:
              paidOrdersList.length > 0 ? revenue / paidOrdersList.length : 0,
            pendingOrders,
            undeliveredOrders,
            paidOrders,
            completedOrders,
          });

          setOrders(paidOrdersList);
          setAllOrders(allOrdersList);

          // Prepare chart data - group by date (for PAID orders)
          const dateMap: Record<string, ChartDataItem> = {};
          paidOrdersList.forEach((order) => {
            const date = new Date(order.created_at).toLocaleDateString("vi-VN");
            if (!dateMap[date]) {
              dateMap[date] = { date, revenue: 0, profit: 0, orders: 0 };
            }
            dateMap[date].revenue += order.total_amount;
            dateMap[date].profit += calculateOrderProfit(order);
            dateMap[date].orders += 1;
          });

          const chartDataArray = Object.values(dateMap).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setChartData(chartDataArray);

          // Calculate product statistics (for PAID orders)
          const productMap: Record<string, ProductStat> = {};
          paidOrdersList.forEach((order) => {
            order.items.forEach((item) => {
              if (!productMap[item.product_name]) {
                productMap[item.product_name] = {
                  name: item.product_name,
                  quantity: 0,
                  revenue: 0,
                };
              }
              productMap[item.product_name].quantity += item.quantity;
              productMap[item.product_name].revenue += item.subtotal;
            });
          });

          const topProducts = Object.values(productMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
          setProductStats(topProducts);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Revenue Overview
        </h1>

        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From paid orders
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Profit (50%)</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From paid orders
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
                <p className="text-xs text-gray-500 mt-1">Counted in revenue</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.avgOrderValue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Paid orders</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Undelivered Orders</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.undeliveredOrders}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Paid Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.paidOrders}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Orders</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedOrders}
                </p>
                <p className="text-xs text-gray-500 mt-1">Delivered & Paid</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue & Profit Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Revenue & Profit by Day
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  name="Revenue"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  name="Profit"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top 5 Best Selling Products
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productStats}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => {
                    const name = String(entry.name || "");
                    const revenue = Number(entry.revenue || 0);
                    return `${name}: ${formatCurrency(revenue)}`;
                  }}
                  labelLine={false}
                >
                  {productStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Orders by Day
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#8B5CF6" name="Number of Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Orders (Paid)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipping Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit (50%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 10).map((order) => {
                    const orderProfit = calculateOrderProfit(order);

                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.order_code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              {item.product_name} (x{item.quantity})
                            </div>
                          ))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatCurrency(order.shipping_fee)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                          {formatCurrency(order.discount_amount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(orderProfit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "shipping"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "processing"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "confirmed"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status === "delivered"
                              ? "Delivered"
                              : order.status === "shipping"
                              ? "Shipping"
                              : order.status === "processing"
                              ? "Processing"
                              : order.status === "confirmed"
                              ? "Confirmed"
                              : "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
