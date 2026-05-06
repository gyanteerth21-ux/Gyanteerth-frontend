import { useNavigate } from "react-router-dom";

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  return (
    <div className="card">

      <h3 className="font-semibold">{course.title}</h3>
      <p className="text-sm text-gray-500">Instructor Name</p>

      <div className="text-sm mt-2">
        ⭐ 4.5 | 👥 120 students
      </div>

      <div className="flex gap-2 mt-4">
        <button
          className="btn-primary"
          onClick={() => navigate(`/student/player/${course.id}`)}
        >
          Continue
        </button>

        <button className="btn-outline">Details</button>
      </div>

    </div>
  );
}
