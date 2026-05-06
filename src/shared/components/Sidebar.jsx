import { Link } from "react-router-dom";
import { navConfig } from "../config/navConfig";
import { useApp } from "../../app/AppContext";

export default function Sidebar() {
  const { user } = useApp();
  const links = navConfig[user.role] || [];

  return (
    <div className="w-64 bg-white border-r h-screen p-4 flex flex-col justify-between">

      <div>
        <h1 className="text-xl font-bold text-green-600 mb-6">
          EduPortal
        </h1>

        <div className="space-y-2">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-3 py-2 rounded-lg hover:bg-green-100"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm mb-2">John Doe</p>
        <button className="btn-outline w-full">Logout</button>
      </div>

    </div>
  );
}
