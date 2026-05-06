import { useApp } from "../../app/AppContext";
import { useNavigate } from "react-router-dom";

export default function RoleSwitcher() {
  const { setUser } = useApp();
  const navigate = useNavigate();

  const changeRole = (role) => {
    setUser({ role });

    if (role === "admin") navigate("/admin/dashboard");
    if (role === "trainer") navigate("/trainer/dashboard");
    if (role === "student") navigate("/student/dashboard");
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => changeRole("admin")}>Admin</button>
      <button onClick={() => changeRole("trainer")}>Trainer</button>
      <button onClick={() => changeRole("student")}>Student</button>
    </div>
  );
}
