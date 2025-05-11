import React, { useState, useEffect } from 'react'
import { StaffContextProvider } from '../../contexts/StaffContexts/StaffAuthContext'
import { matchPath, useLocation } from 'react-router-dom'
import StaffNavbarComponent from '../components/StaffComponents/StaffNavbarComponent'
import StaffSidebarComponent from '../components/StaffComponents/StaffSidebarComponent'
import { Route, Routes } from 'react-router-dom'
import StaffProductsPage from '../pages/StaffPage/StaffProductsPage'
import StaffOrdersWalkinPage from '../pages/StaffPage/StaffOrdersWalkinPage'
// import StaffPaymentPage from '../pages/StaffPage/StaffPaymentPage'
import StaffOrdersPage from '../pages/StaffPage/StaffOrdersPage'
import StaffOrdersDetailsPage from '../pages/StaffPage/StaffOrdersDetailsPage'
import StaffSettingsPage from '../pages/StaffPage/StaffSettingsPage'
import StaffOrderSummaryPage from '../pages/StaffPage/StaffOrderSummaryPage'
import StaffDashboardPage from '../pages/StaffPage/StaffDashboardPage'
import StaffAccountsPage from '../pages/StaffPage/StaffAccountsPage'
import StaffDirectOrdersPage from '../pages/StaffPage/StaffDirectOrdersPage'
import StaffDirectOrdersDetailsPage from '../pages/StaffPage/StaffDirectOrdersDetailsPage'
import StaffOrdersRefillPage from '../pages/StaffPage/StaffOrdersRefillPage'
import StaffOrdersPickupPage from '../pages/StaffPage/StaffOrdersPickupPage'
import StaffOrdersPickupDetailsPage from '../pages/StaffPage/StaffOrdersPickupDetailsPage'
import StaffOrderSummaryRefillPage from '../pages/StaffPage/StaffOrderSummaryRefillPage'
import StaffQuickSalesWalkinPage from '../pages/StaffPage/StaffQuickSalesOrder/StaffQuickSalesWalkinPage'
import StaffQuickSalesRefillPage from '../pages/StaffPage/StaffQuickSalesOrder/StaffQuickSalesRefillPage'
import StaffRefillProductPage from '../pages/StaffPage/StaffRefillProductPage'
import InventoryReportPage from '../pages/StaffPage/InventoryReportPage'

function StaffRoutes() {
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
    const isSettingsPage = matchPath('/staff/settings/:adminId', location.pathname);

    //dynamic class for main container based on sidebar state
    const getMainContainerClass = () => {
        if (isMobile) {
            return 'admin-main-container mobile';
        } else {
            return `admin-main-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`;
        }
    };

    return (
        <StaffContextProvider>
            {/* conditionally render StaffNavbarComponent */}
            {
                !isSettingsPage && (
                    <StaffNavbarComponent 
                        toggleMobileSidebar={() => setMobileSidebarVisible(!mobileSidebarVisible)} 
                        isMobile={isMobile}
                    />
                )
            }
            
            {/* new sidebar component with state handlers */}
            <StaffSidebarComponent 
                onSidebarStateChange={handleSidebarStateChange} 
                onMobileSidebarToggle={handleMobileSidebarToggle}
                mobileOpen={mobileSidebarVisible}
            />
            
            <div className={getMainContainerClass()}>
            <Routes>
                <Route path='/staff/dashboard' element={<StaffDashboardPage />} />
                {/* <Route path='/staff/home' element={<StaffHomePage />} /> */}
                <Route path='/staff/inventory/finished-product' element={<StaffProductsPage />} />
                <Route path='/staff/inventory/refill-product' element={<StaffRefillProductPage />} />
                <Route path='/staff/direct-orders' element={<StaffDirectOrdersPage />} />
                <Route path='/staff/direct-orders/details/:productId' element={<StaffDirectOrdersDetailsPage />} />
                <Route path='/staff/walkins' element={<StaffOrdersWalkinPage />} />
                <Route path='/staff/refills' element={<StaffOrdersRefillPage />} />
                {/* <Route path='/staff/payment' element={<StaffPaymentPage />} /> */}
                <Route path='/staff/orders' element={<StaffOrdersPage />} />
                <Route path='/staff/orders-pickup' element={<StaffOrdersPickupPage />} />
                <Route path='/staff/order-summary/:orderId' element={<StaffOrderSummaryPage/>} />
                <Route path='/staff/order-summary-refill/:orderId' element={<StaffOrderSummaryRefillPage/>} />
                <Route path='/staff/orders/details/:orderId' element={<StaffOrdersDetailsPage />} />
                <Route path='/staff/orders-pickup/details/:orderId' element={<StaffOrdersPickupDetailsPage />} />
                <Route path='/staff/quicksales/sales-walkin' element={<StaffQuickSalesWalkinPage />} />
                <Route path='/staff/quicksales/sales-refill' element={<StaffQuickSalesRefillPage />} />
                <Route path='/staff/settings/:staffId' element={<StaffSettingsPage />} />
                <Route path='/staff/accounts' element={<StaffAccountsPage />} />
                <Route path='/staff/reports/inventory-report' element={<InventoryReportPage/>} />
            </Routes>
            </div>
        </StaffContextProvider>
    )
}

export default StaffRoutes