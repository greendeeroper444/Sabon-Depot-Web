import React, { useState, useEffect } from 'react'
import { AdminContextProvider } from '../../contexts/AdminContexts/AdminAuthContext'
import { matchPath, useLocation } from 'react-router-dom'
import AdminNavbarComponent from '../components/AdminComponents/AdminNavbarComponent'
import AdminSidebarComponent from '../components/AdminComponents/AdminSidebarComponent'
import { Route, Routes } from 'react-router-dom'
import AdminDashboardPage from '../pages/AdminPage/AdminDashboardPage'
import AdminOrdersPage from '../pages/AdminPage/AdminOrdersPage'
import AdminOrdersDetailsPage from '../pages/AdminPage/AdminOrdersDetailsPage'
import AdminFinishedProductPage from '../pages/AdminPage/InventoryPage/AdminFinishedProductPage'
import AdminAccountsPage from '../pages/AdminPage/AdminAccountsPage'
import InventoryReport from '../pages/AdminPage/ReportsPage/InventoryReport'
import SalesReport from '../pages/AdminPage/ReportsPage/SalesReport'
import AdminAccountDetails from '../pages/AdminPage/AdminAccountDetails'
import AdminWorkinProgressPage from '../pages/AdminPage/InventoryPage/AdminWorkinProgressPage'
import AdminOrdersWalkinPage from '../pages/AdminPage/AdminOrderWalkinPage'
import AdminOrdersRefillPage from '../pages/AdminPage/AdminOrdersRefillPage'
import AdminOrdersPickupPage from '../pages/AdminPage/AdminOrdersPickupPage'
import AdminQuickSalesPage from '../pages/AdminPage/AdminQuickSalesPage'
import AdminOrderSummaryPage from '../pages/AdminPage/AdminOrderSummaryPage'
import AdminSettingsPage from '../pages/AdminPage/AdminSettingsPage'
import AdminOrdersPickupDetailsPage from '../pages/AdminPage/AdminOrdersPickupDetails'
import AdminRefillProductPage from '../pages/AdminPage/InventoryPage/AdminRefillProductPage'
import AdminQuickSalesWalkinPage from '../pages/AdminPage/QuickSalesPage/AdminQuickSalesWalkinPage'
import AdminQuickSalesRefillPage from '../pages/AdminPage/QuickSalesPage/AdminQuickSalesRefillPage'
import AdminOrderSummaryRefillPage from '../pages/AdminPage/AdminOrderSummaryRefillPage'

function AdminRoutes() {
    const location = useLocation();
    //state to track if sidebar is collapsed
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    //state to track mobile sidebar visibility
    const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
    
    //check if current screen size is mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    //handler to receive sidebar state from the sidebar component
    const handleSidebarStateChange = (isCollapsed) => {
        setSidebarCollapsed(isCollapsed);
    };

    //handler to receive mobile sidebar visibility state
    const handleMobileSidebarToggle = (isVisible) => {
        setMobileSidebarVisible(isVisible);
    };

    //handle window resize for responsive behavior
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            //auto-hide mobile sidebar when resizing to desktop
            if (window.innerWidth > 768) {
                setMobileSidebarVisible(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    //check if the current route matches the settings path
    const isSettingsPage = matchPath('/admin/settings/:adminId', location.pathname);

    //dynamic class for main container based on sidebar state
    const getMainContainerClass = () => {
        if (isMobile) {
            return 'admin-main-container mobile';
        } else {
            return `admin-main-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`;
        }
    };

    return (
        <AdminContextProvider>
            {/* conditionally render AdminNavbarComponent */}
            {
                !isSettingsPage && (
                    <AdminNavbarComponent 
                        toggleMobileSidebar={() => setMobileSidebarVisible(!mobileSidebarVisible)} 
                        isMobile={isMobile}
                    />
                )
            }
            
            {/* new sidebar component with state handlers */}
            <AdminSidebarComponent 
                onSidebarStateChange={handleSidebarStateChange} 
                onMobileSidebarToggle={handleMobileSidebarToggle}
                mobileOpen={mobileSidebarVisible}
            />
            
            <div className={getMainContainerClass()}>
                <Routes>
                    <Route path='/admin/dashboard' element={<AdminDashboardPage />} />
                    <Route path='/admin/orders' element={<AdminOrdersPage />} />
                    <Route path='/admin/orders-pickup' element={<AdminOrdersPickupPage />} />
                    <Route path='/admin/orders/details/:orderId' element={<AdminOrdersDetailsPage />} />
                    <Route path='/admin/orders-pickup/details/:orderId' element={<AdminOrdersPickupDetailsPage />} />
                    <Route path='/admin/walkins' element={<AdminOrdersWalkinPage />} />
                    <Route path='/admin/refills' element={<AdminOrdersRefillPage />} />
                    <Route path='/admin/inventory/finished-product' element={<AdminFinishedProductPage />} />
                    <Route path='/admin/inventory/workin-progress' element={<AdminWorkinProgressPage />} />
                    <Route path='/admin/inventory/refill-product' element={<AdminRefillProductPage />} />
                    <Route path='/admin/quicksales/sales-walkin' element={<AdminQuickSalesWalkinPage />} />
                    <Route path='/admin/quicksales/sales-refill' element={<AdminQuickSalesRefillPage />} />
                    <Route path='/admin/accounts' element={<AdminAccountsPage />} />
                    <Route path='/admin/reports/inventory-report' element={<InventoryReport />} />
                    <Route path='/admin/reports/sales-report' element={<SalesReport />} />
                    <Route path='/admin/accounts/:id' element={<AdminAccountDetails />} />
                    <Route path='/admin/quick-sales' element={<AdminQuickSalesPage />} />
                    <Route path='/admin/order-summary/:orderId' element={<AdminOrderSummaryPage />} />
                    <Route path='/admin/order-summary-refill/:orderId' element={<AdminOrderSummaryRefillPage />} />
                    <Route path='/admin/settings/:adminId' element={<AdminSettingsPage />} />
                </Routes>
            </div>
        </AdminContextProvider>
    )
}

export default AdminRoutes