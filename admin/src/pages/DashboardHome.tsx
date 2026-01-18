import { collection, getCountFromServer, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import {
    Activity,
    Clock,
    Download,
    FileText,
    Plus,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useRole } from '../hooks/useRole';
import { db } from '../lib/firebase';

export const DashboardHome = () => {
    const { role, user } = useRole();
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalArticles: 0,
        pendingReview: 0,
        totalAuthors: 0 // Mock or fetch if you have a users collection
    });
    const [recentArticles, setRecentArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
             try {
                 // 1. Total Articles
                 const articlesCol = collection(db, 'articles');
                 const totalSnap = await getCountFromServer(articlesCol);
                 const total = totalSnap.data().count;

                 // 2. Pending Review (only fetching if admin, or fetch all and filter?)
                 // Queries for counts can be expensive if not careful, but getCountFromServer is optimized.
                 const pendingQuery = query(articlesCol, where('status', '==', 'in_review'));
                 const pendingSnap = await getCountFromServer(pendingQuery);
                 const pending = pendingSnap.data().count;

                 // 3. Recent Articles
                 const recentQuery = query(articlesCol, orderBy('updatedAt', 'desc'), limit(5));
                 const recentSnap = await getDocs(recentQuery);
                 const recent = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                 setStats({
                     totalArticles: total,
                     pendingReview: pending,
                     totalAuthors: 12 // Mock for now
                 });
                 setRecentArticles(recent);
             } catch (error) {
                 console.error("Error fetching dashboard stats:", error);
             } finally {
                 setLoading(false);
             }
        };

        fetchStats();
    }, []);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                 <button 
                    onClick={() => navigate('/content-manager/articles/create')}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-gray-50 hover:bg-gray-900/90 h-9 px-4 py-2 shadow"
                 >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Article
                 </button>
            </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                    {/* Metrics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                                <FileText className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? '--' : stats.totalArticles}</div>
                                <p className="text-xs text-gray-500">+20.1% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                                <Clock className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? '--' : stats.pendingReview}</div>
                                <p className="text-xs text-gray-500">
                                    {stats.pendingReview > 0 ? 'Requires attention' : 'All caught up'}
                                </p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Writers</CardTitle>
                                <Users className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+12</div>
                                <p className="text-xs text-gray-500">+2 new this week</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                <Activity className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+573.2K</div>
                                <p className="text-xs text-gray-500">+201 since last hour</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Charts & Recent Activity */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>Article views per month (Mock Data)</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                {/* Simplified CSS Bar Chart Visualization */}
                                <div className="h-[350px] flex items-end justify-between gap-2 px-4 pt-10 pb-2">
                                    {[35, 78, 45, 90, 60, 40, 80, 50, 70, 65, 85, 95].map((h, i) => (
                                        <div key={i} className="w-full bg-blue-600 rounded-t-sm hover:opacity-80 transition-opacity relative group" style={{ height: `${h}%` }}>
                                             {/* Tooltip */}
                                            <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded transition-opacity">
                                                {h * 100}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between px-4 text-xs text-gray-500 mt-2">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Articles</CardTitle>
                                <CardDescription>
                                    You made {recentArticles.length} updates recently.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {loading ? (
                                        <div className="text-center text-gray-500 py-4">Loading...</div>
                                    ) : recentArticles.map((article) => (
                                        <div key={article.id} className="flex items-center group cursor-pointer" onClick={() => navigate(`/content-manager/articles/${article.id}`)}>
                                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                                {/* Avatar Fallback */}
                                                 <span className="font-medium text-xs text-gray-600">
                                                     {article.author ? article.author.substring(0,2).toUpperCase() : '8K'}
                                                 </span>
                                            </div>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none group-hover:text-blue-600 transition-colors line-clamp-1">{article.title}</p>
                                                <p className="text-xs text-muted-foreground text-gray-500">
                                                    {article.authorEmail || 'Unknown Author'}
                                                </p>
                                            </div>
                                            <div className={`ml-auto font-medium text-xs px-2 py-1 rounded-full capitalize 
                                                ${article.status === 'published' ? 'bg-green-100 text-green-700' : 
                                                  article.status === 'in_review' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {article.status || 'draft'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                         <CardHeader>
                            <CardTitle>Detailed Analytics</CardTitle>
                            <CardDescription>
                                Deep dive into your content performance.
                            </CardDescription>
                         </CardHeader>
                         <CardContent>
                            <div className="h-96 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                                <div className="text-center">
                                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">Analytics Coming Soon</h3>
                                    <p className="text-gray-500">We are integrating detailed charts and user behavior tracking.</p>
                                </div>
                            </div>
                         </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                     <Card>
                         <CardHeader>
                            <CardTitle>Generated Reports</CardTitle>
                            <CardDescription>
                                Download monthly content and performance summaries.
                            </CardDescription>
                         </CardHeader>
                         <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">January 2024 Performance</p>
                                            <p className="text-sm text-gray-500">Generated on Feb 1, 2024</p>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                        <Download className="h-4 w-4" /> Download PDF
                                    </button>
                                </div>
                                 <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">2023 Year End Review</p>
                                            <p className="text-sm text-gray-500">Generated on Jan 10, 2024</p>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                        <Download className="h-4 w-4" /> Download PDF
                                    </button>
                                </div>
                            </div>
                         </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                         <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>
                                Recent alerts and system messages.
                            </CardDescription>
                         </CardHeader>
                         <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 border-l-4 border-blue-500 bg-blue-50">
                                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">System Maintenance Scheduled</p>
                                        <p className="text-sm text-gray-600">The platform will be down for maintenance on Sunday at 2 AM EST.</p>
                                        <p className="text-xs text-blue-600 mt-2">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 border-l-4 border-green-500 bg-green-50">
                                    <Activity className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">New Feature: Location Targeting</p>
                                        <p className="text-sm text-gray-600">You can now target articles by City, State, and Country.</p>
                                        <p className="text-xs text-green-600 mt-2">1 day ago</p>
                                    </div>
                                </div>
                            </div>
                         </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
