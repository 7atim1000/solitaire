import { 
  FaCogs,
  FaUser,
  FaTags,
  FaShoppingCart,
  FaBuilding, 
  FaLayerGroup

} from 'react-icons/fa';

import { PiCurrencyDollarLight } from "react-icons/pi";
import { ImUsers } from "react-icons/im";
import { FaSortAmountUp } from "react-icons/fa";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { ImCalculator } from "react-icons/im";
import { FaCommentsDollar } from "react-icons/fa";
import { AiFillContainer } from "react-icons/ai";
import { IoSettingsSharp } from "react-icons/io5";
import { BiSolidDashboard } from "react-icons/bi";
import { FaUnity } from "react-icons/fa6";
import { BiFoodMenu } from "react-icons/bi";
import { FaConciergeBell } from "react-icons/fa";
import { IoBookmarksOutline } from "react-icons/io5";
import { SiCustomink } from "react-icons/si";

export const SidebarMenuLinks = [
  
  { 
    name: "Dashboard", 
    path: "/", 
    icon: BiSolidDashboard,
  },
  { 
    name: "Companies", 
    path: "/companies", 
    icon: SiCustomink,
  },
  { 
    name: "Guests", 
    path: "/guests", 
    icon: ImUsers,
  },

  { 
    name: "Rooms Management", 
    path: "#",
    icon: FaCogs,
    iconUncolored: FaCogs,
    isExpanded: false,
    subItems: [
      {
        name: "Floors",
        path: "/floors",
        icon: FaLayerGroup
      },
      {
        name: "Categories",
        path: "/categories",
        icon: FaTags
      },
      {
        name: "Rooms",
        path: "/rooms",
        icon: FaBuilding
      },
    ]
  },



  { 
    name: "Room Services", 
    path: "#",
    icon: FaConciergeBell,
    isExpanded: false,
    subItems: [
      {
        name: "Services",
        path: "/categories",
        icon: FaTags
      },
      {
        name: "Units",
        path: "/units",
        icon: FaUnity
      },
      {
        name: "Items",
        path: "/items",
        icon: BiFoodMenu
      },
    ]
  },

  { 
    name: "Reservations", 
    path: "#",
    icon: AiFillContainer,
    isExpanded: false,
    subItems: [
      {
        name: "Booking",
        path: "/roomsbill",
        icon: AiFillContainer
      },
      {
        name: "Management",
        path: "/invoices",
        icon: IoSettingsSharp
      }
    ]
  },

  { 
    name: "Financials", 
    path: "#",
    icon: ImCalculator,
    
    isExpanded: false,
    subItems: [
      {
        name: "Transactions",
        path: "/transactions",
        icon: GrTransaction
      },
      {
        name: "Incomes",
        path: "/income",
        icon: FaSortAmountUp
      },
      {
        name: "Expenses",
        path: "/expense",
        icon: FaSortAmountUpAlt
      },
      {
        name: "Exchange rate",
        path: "/rate",
        icon: FaCommentsDollar
      },
    ]
  },

  { 
    name: "Tax Report", 
    path: "/tax", 
    icon: IoBookmarksOutline,
  },

  
];


// export const SidebarMenuLinks = [
//     { 
//         name: "Stores", 
//         path: "/stores", 
//         icon: "https://nq5udmrdco.ufs.sh/f/Kfo4jX11Imre0Qs16mZdWKx1SgnYe50PkAVuQcaX2JvTZrBj",
//         iconUnclored: "https://nq5udmrdco.ufs.sh/f/Kfo4jX11Imreqr0W2oyRP7d8epi2sLgfvzSKZ45JExojOmDA",

      
//     },
//     { 
//         name: "Categories", 
//         path: "/categories" ,
//         iconUnclored: "https://nq5udmrdco.ufs.sh/f/Kfo4jX11ImrePN0Estj4X5u0WMSRTgvonOQ8Bsi7HFhEJfbG",
//         icon: "https://nq5udmrdco.ufs.sh/f/Kfo4jX11ImreyaK9UjPtFyGrfM8CsxjlL0U2Xn15RPAwYZo6"
//     },
//     { 
//         name: "Profile", 
//         path: "/admin/profile", 
//         icon: "https://nq5udmrdco.ufs.sh/f/Kfo4jX11ImrerETCyteMWJ5zE2rwmADpd3ZCBFcShlTXeMvN" ,
//         iconUnclored:"https://nq5udmrdco.ufs.sh/f/Kfo4jX11ImrehkpZN12E7D3eplIFN5VO0kRwtfA4MGdQJKUc"
//     },
 
// ];
