import React, { useContext, useState, useEffect } from 'react'
import '../../CSS/AdminCSS/AdminSidebar.css';
import { NavLink } from 'react-router-dom';
import logoDepot from '../../assets/icons/logo-depot-3-circle.png';
import dashboardIcon from '../../assets/admin/adminicons/admin-sidebar-dashboard-icon.png';
import dashboardIconWhite from '../../assets/admin/adminicons/admin-sidebar-dashboard-icon-white.png';
import ordersIcon from '../../assets/admin/adminicons/admin-sidebar-orders-icon.png';
import inventoryIcon from '../../assets/admin/adminicons/admin-sidebar-inventory-report-icon.png';
import accountsIcon from '../../assets/admin/adminicons/admin-sidebar-accounts-icon.png';
import accountsIconWhite from '../../assets/admin/adminicons/admin-sidebar-accounts-icon-white.png';
import reportsIcon from '../../assets/admin/adminicons/admin-sidebar-inventory-report-icon.png';
import quickSalesIcon from '../../assets/admin/adminicons/quick-sales.png';
import quickSalesIconWhite from '../../assets/admin/adminicons/quick-sales-white.png';
import settingsIcon from '../../assets/admin/adminicons/settings.png';
import settingsIconWhite from '../../assets/admin/adminicons/settings-white.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faBars, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { AdminContext } from '../../../contexts/AdminContexts/AdminAuthContext';

function StaffSidebarComponent({onSidebarStateChange, onMobileSidebarToggle, mobileOpen = false}) {
    const {admin} = useContext(AdminContext);
    const [isDropdownOpenInventory, setIsDropdownOpenInventory] = useState(false);
    const [isDropdownOpenReports, setIsDropdownOpenReports] = useState(false);
    const [isDropdownTransaction, setIsDropdownTransaction] = useState(false);
    const [isDropdownOpenQuickSales, setIsDropdownOpenQuickSales] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [mobileSidebarVisible, setMobileSidebarVisible] = useState(mobileOpen);

    //update state when prop changes
    useEffect(() => {
        setMobileSidebarVisible(mobileOpen);
    }, [mobileOpen]);

    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth <= 768;
            setIsMobile(newIsMobile);
            
            //reset mobile visibility on screen size change
            if (!newIsMobile && mobileSidebarVisible) {
                setMobileSidebarVisible(false);
                if (onMobileSidebarToggle) onMobileSidebarToggle(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [mobileSidebarVisible, onMobileSidebarToggle]);

    //notify parent component when sidebar state changes
    useEffect(() => {
        if (onSidebarStateChange) {
            onSidebarStateChange(collapsed);
        }
    }, [collapsed, onSidebarStateChange]);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const toggleDropdownTransaction = () => {
        if (collapsed) {
            setCollapsed(false);
            setTimeout(() => {
                setIsDropdownTransaction(!isDropdownTransaction);
            }, 300);
        } else {
            setIsDropdownTransaction(!isDropdownTransaction);
        }
    };

    const toggleDropdownInventory = () => {
        if (collapsed) {
            setCollapsed(false);
            setTimeout(() => {
                setIsDropdownOpenInventory(!isDropdownOpenInventory);
            }, 300);
        } else {
            setIsDropdownOpenInventory(!isDropdownOpenInventory);
        }
    };

    const toggleDropdownReports = () => {
        if (collapsed) {
            setCollapsed(false);
            setTimeout(() => {
                setIsDropdownOpenReports(!isDropdownOpenReports);
            }, 300);
        } else {
            setIsDropdownOpenReports(!isDropdownOpenReports);
        }
    };

    const toggleDropdownQuickSales = () => {
        if (collapsed) {
            setCollapsed(false);
            setTimeout(() => {
                setIsDropdownOpenQuickSales(!isDropdownOpenQuickSales);
            }, 300);
        } else {
            setIsDropdownOpenQuickSales(!isDropdownOpenQuickSales);
        }
    };

    //toggle mobile sidebar and notify parent
    const toggleMobileSidebar = () => {
        const newState = !mobileSidebarVisible;
        setMobileSidebarVisible(newState);
        if (onMobileSidebarToggle) {
            onMobileSidebarToggle(newState);
        }
    };

    return (
        <>
            {/* mobile Menu Toggle Button */}
            <div className="mobile-toggle-button" onClick={toggleMobileSidebar}>
                <FontAwesomeIcon icon={faBars} />
            </div>

            {/* sidebar */}
            <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''} ${mobileSidebarVisible ? 'mobile-open' : ''}`}>
                <div className="sidebar-collapse-btn" onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
                </div>
                
                <div className='admin-sidebar-header'>
                    <img src={logoDepot} alt="Logo" className='logo' />
                    {!collapsed && <h2>Staff</h2>}
                </div>
                
                <ul className='admin-sidebar-list'>
                    <li>
                        <NavLink 
                            to='/staff/dashboard' 
                            className='admin-sidebar-item' 
                            activeClassName='active'
                            data-tooltip="Dashboard"
                        >
                            <img src={dashboardIcon} alt="Dashboard" className='sidebar-icon' />
                            <img src={dashboardIconWhite} alt="Dashboard" className='sidebar-icon-active' />
                            {!collapsed && <span>Dashboard</span>}
                        </NavLink>
                    </li>
                    <li>
                        <div 
                            className='admin-sidebar-item' 
                            onClick={toggleDropdownTransaction}
                            data-tooltip="Transaction"
                        >
                            <img src={ordersIcon} alt="Transaction" className='sidebar-icon' />
                            {!collapsed && <span>Transaction</span>}
                            {!collapsed && <FontAwesomeIcon className="dropdown-icon" icon={isDropdownTransaction ? faAngleUp : faAngleDown} />}
                        </div>
                        {
                            !collapsed && isDropdownTransaction && (
                                <div className='admin-sidebar-item-dropdown'>
                                    <NavLink to='/staff/orders' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Online</span>
                                    </NavLink>
                                    <NavLink to='/staff/orders-pickup' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Pick Up</span>
                                    </NavLink>
                                    <NavLink to='/staff/walkins' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Walkin</span>
                                    </NavLink>
                                    <NavLink to='/staff/refills' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Refill</span>
                                    </NavLink>
                                </div>
                            )
                        }
                    </li>
                    <li>
                        <div 
                            className='admin-sidebar-item' 
                            onClick={toggleDropdownInventory}
                            data-tooltip="Inventory"
                        >
                            <img src={inventoryIcon} alt="Inventory" className='sidebar-icon' />
                            {!collapsed && <span>Inventory</span>}
                            {!collapsed && <FontAwesomeIcon className="dropdown-icon" icon={isDropdownOpenInventory ? faAngleUp : faAngleDown} />}
                        </div>
                        {
                            !collapsed && isDropdownOpenInventory && (
                                <div className='admin-sidebar-item-dropdown'>
                                    <NavLink to='/staff/inventory/finished-product' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Finished Goods</span>
                                    </NavLink>
                                    <NavLink to='/staff/inventory/refill-product' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Refill Products</span>
                                    </NavLink>
                                </div>
                            )
                        }
                    </li>
                    <li>
                        <div 
                            className='admin-sidebar-item' 
                            onClick={toggleDropdownQuickSales}
                            data-tooltip="Sales"
                        >
                            <img src={quickSalesIcon} alt="Sales" className='sidebar-icon' />
                            {!collapsed && <span>Sales</span>}
                            {!collapsed && <FontAwesomeIcon className="dropdown-icon" icon={isDropdownOpenQuickSales ? faAngleUp : faAngleDown} />}
                        </div>
                        {
                            !collapsed && isDropdownOpenQuickSales && (
                                <div className='admin-sidebar-item-dropdown'>
                                    <NavLink to='/staff/quicksales/sales-walkin' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Sales Walkin</span>
                                    </NavLink>
                                    <NavLink to='/staff/quicksales/sales-refill' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Sales Refill</span>
                                    </NavLink>
                                </div>
                            )
                        }
                    </li>
                    <li>
                        <NavLink 
                            to='/staff/accounts' 
                            className='admin-sidebar-item' 
                            activeClassName='active'
                            data-tooltip="Accounts"
                        >
                            <img src={accountsIcon} alt="Accounts" className='sidebar-icon' />
                            <img src={accountsIconWhite} alt="Accounts" className='sidebar-icon-active' />
                            {!collapsed && <span>Accounts</span>}
                        </NavLink>
                    </li>
                    {/* <li>
                        <div 
                            className='admin-sidebar-item' 
                            onClick={toggleDropdownReports}
                            data-tooltip="Reports"
                        >
                            <img src={reportsIcon} alt="Reports" className='sidebar-icon' />
                            {!collapsed && <span>Reports</span>}
                            {!collapsed && <FontAwesomeIcon className="dropdown-icon" icon={isDropdownOpenReports ? faAngleUp : faAngleDown} />}
                        </div>
                        {
                            !collapsed && isDropdownOpenReports && (
                                <div className='admin-sidebar-item-dropdown'>
                                    <NavLink to='/staff/reports/inventory-report' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Inventory Report</span>
                                    </NavLink>
                                    <NavLink to='/staff/reports/sales-report' className='admin-sidebar-item sub-item' activeClassName='active'>
                                        <span>Sales Report</span>
                                    </NavLink>
                                </div>
                            )
                        }
                    </li> */}
                    <li>
                        <NavLink 
                            to={`/admin/settings/${admin?._id}`} 
                            className='admin-sidebar-item' 
                            activeClassName='active'
                            data-tooltip="Settings"
                        >
                            <img src={settingsIcon} alt="Settings" className='sidebar-icon' />
                            <img src={settingsIconWhite} alt="Settings" className='sidebar-icon-active' />
                            {!collapsed && <span>Settings</span>}
                        </NavLink>
                    </li>
                </ul>
            </div>
            
            {/* backdrop for mobile */}
            {
                isMobile && mobileSidebarVisible && (
                    <div className="sidebar-backdrop" onClick={toggleMobileSidebar}></div>
                )
            }
        </>
    )
}

export default StaffSidebarComponent