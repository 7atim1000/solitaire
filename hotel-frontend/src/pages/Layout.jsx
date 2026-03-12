import Sidebar from '../components/shared/Sidebar'; 
import { Outlet } from 'react-router-dom' ; 

const Layout = () => {
    return(
        <div className ='flex flex-col'>
           
            
            <div className ='flex'>
                <Sidebar/>
                <Outlet/>
            </div>
        </div>
    );
}


export default Layout;