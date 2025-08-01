import React, { useContext, useState } from 'react'
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import settingsIcon from '../../assets/admin/adminicons/settings.png';
import settingsIconWhite from '../../assets/admin/adminicons/settings-white.png';
import { AdminContext } from '../../../contexts/AdminContexts/AdminAuthContext';
import quickSalesIcon from '../../assets/admin/adminicons/quick-sales.png';

function AdminSidebarResponsiveComponent({adminCloseSidebar}) {
    const [isDropdownOpenInventory, setIsDropdownOpenInventory] = useState(false);
    const [isDropdownOpenReports, setIsDropdownOpenReports] = useState(false);
    const [isDropdownTransaction, setIsDropdownTransaction] = useState(false);
    const [isDropdownOpenQuickSales, setIsDropdownOpenQuickSales] = useState(false);
    const {admin} = useContext(AdminContext);

    const toggleDropdownTransaction = () => {
        setIsDropdownTransaction(!isDropdownTransaction);
    };
    const toggleDropdownQuickSales = () => {
        setIsDropdownOpenQuickSales(!isDropdownOpenQuickSales);
    };

    const toggleDropdownInventory = () => {
        setIsDropdownOpenInventory(!isDropdownOpenInventory);
    };

    const toggleDropdownReports = () => {
        setIsDropdownOpenReports(!isDropdownOpenReports);
    };
    
  return (
    <div className='admin-sidebar'>
        <div className='admin-sidebar-header'>
            <img src={logoDepot} alt="Logo" className='logo' />
            <h2>Admin</h2>
        </div>
        <ul className='admin-sidebar-list'>
            <li>
                <NavLink to='/admin/dashboard' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                    <img src={dashboardIcon} alt="Dashboard" className='sidebar-icon' />
                    <img src={dashboardIconWhite} alt="Orders" className='sidebar-icon-active' />
                    <span>Dashboard</span>
                </NavLink>
            </li>
            <li>
                <div className='admin-sidebar-item' onClick={toggleDropdownTransaction}>
                    <img src={ordersIcon} alt="Inventory" className='sidebar-icon' />
                    <span>Transaction</span>
                    <FontAwesomeIcon icon={isDropdownTransaction ? faAngleUp : faAngleDown} />
                </div>
                {
                    isDropdownTransaction && (
                        <div className='admin-sidebar-item-dropdown'>
                            <NavLink to='/admin/orders' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Online</span>
                            </NavLink>
                            <NavLink to='/admin/orders-pickup' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Pick Up</span>
                            </NavLink>
                            <NavLink to='/admin/walkins' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Walkin</span>
                            </NavLink>
                            <NavLink to='/admin/refills' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Refill</span>
                            </NavLink>
                        </div>
                    )
                }
            </li>
            {/* <li>
                <NavLink to='/admin/orders' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                    <img src={ordersIcon} alt="Orders" className='sidebar-icon' />
                    <img src={ordersIconWhite} alt="Orders" className='sidebar-icon-active' />
                    <span>Orders</span>
                </NavLink>
            </li> */}
            <li>
                <div className='admin-sidebar-item' onClick={toggleDropdownInventory}>
                    <img src={inventoryIcon} alt="Inventory" className='sidebar-icon' />
                    <span>Inventory</span>
                    <FontAwesomeIcon icon={isDropdownOpenInventory ? faAngleUp : faAngleDown} />
                </div>
                {
                    isDropdownOpenInventory && (
                        <div className='admin-sidebar-item-dropdown'>
                            <NavLink to='/admin/inventory/finished-product' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Finished Goods</span>
                            </NavLink>
                            <NavLink to='/admin/inventory/refill-product' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Refill Products</span>
                            </NavLink>
                        </div>
                    )
                }
            </li>
            {/* <li>
                <NavLink to='/admin/inventory/finished-product' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                    <img src={inventoryIcon} alt="Inventory" className='sidebar-icon' />
                    <img src={inventoryIcon} alt="Inventory" className='sidebar-icon-active' />
                    <span>Inventory</span>
                </NavLink>
            </li> */}
            {/* <li>
                <NavLink to='/admin/quick-sales' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                    <img src={quickSalesIcon} alt="Accounts" className='sidebar-icon' />
                    <img src={quickSalesIconWhite} alt="Acounts" className='sidebar-icon-active' />
                    <span>Quick Sales</span>
                </NavLink>
            </li> */}
                <li>
                <div className='admin-sidebar-item' onClick={toggleDropdownQuickSales}>
                    <img src={quickSalesIcon} alt="Inventory" className='sidebar-icon' />
                    <span>Sales</span>
                    <FontAwesomeIcon icon={isDropdownOpenQuickSales ? faAngleUp : faAngleDown} />
                </div>
                {
                    isDropdownOpenQuickSales && (
                        <div className='admin-sidebar-item-dropdown'>
                            <NavLink to='/admin/quicksales/sales-walkin' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Sales Walkin</span>
                            </NavLink>
                            <NavLink to='/admin/quicksales/sales-refill' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Sales Refill</span>
                            </NavLink>
                        </div>
                    )
                }
            </li>
            <li>
                <NavLink to='/admin/accounts' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                    <img src={accountsIcon} alt="Accounts" className='sidebar-icon' />
                    <img src={accountsIconWhite} alt="Acounts" className='sidebar-icon-active' />
                    <span>Accounts</span>
                </NavLink>
            </li>
            <li>
                <div className='admin-sidebar-item' onClick={toggleDropdownReports}>
                    <img src={reportsIcon} alt="Reports" className='sidebar-icon' />
                    <span>Reports</span>
                    <FontAwesomeIcon icon={isDropdownOpenReports ? faAngleUp : faAngleDown} />
                </div>
                {
                    isDropdownOpenReports && (
                        <div className='admin-sidebar-item-dropdown'>
                            <NavLink to='/admin/reports/inventory-report' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Inventory Report</span>
                            </NavLink>
                            <NavLink to='/admin/reports/sales-report' className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                                <span>Sales Report</span>
                            </NavLink>
                        </div>
                    )
                }
            </li>
            <li>
                <NavLink to={`/admin/settings/${admin?._id}`} className='admin-sidebar-item' activeClassName='active' onClick={adminCloseSidebar}>
                    <img src={settingsIcon} alt="Accounts" className='sidebar-icon' />
                    <img src={settingsIconWhite} alt="Acounts" className='sidebar-icon-active' />
                    <span>Settings</span>
                </NavLink>
            </li>
        </ul>
    </div>
  )
}

export default AdminSidebarResponsiveComponent