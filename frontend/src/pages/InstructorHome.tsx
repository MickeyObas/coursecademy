const InstructorHome = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, Instructor!
        </h1>
        <p className="text-gray-600 text-lg">
          This is your central hub for managing courses, lessons, and assessments.
          Use the sidebar to navigate through your tools and build amazing learning
          experiences for your students.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-blue-50 p-5 rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-blue-700">12</h2>
          <p className="text-gray-600">Courses Created</p>
        </div>
        <div className="bg-green-50 p-5 rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-green-700">48</h2>
          <p className="text-gray-600">Lessons Published</p>
        </div>
        <div className="bg-purple-50 p-5 rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-purple-700">8</h2>
          <p className="text-gray-600">Assessments Ready</p>
        </div>
      </div>

      {/* Next Steps / Guidance */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Get Started
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <span className="font-medium">Create or update courses:</span>{" "}
            Head to <strong>Manage Courses</strong> to add new courses or edit
            existing ones.
          </li>
          <li>
            <span className="font-medium">Build modules and lessons:</span>{" "}
            Use the <strong>Modules/Lessons</strong> section to structure your
            content and keep it organized.
          </li>
          <li>
            <span className="font-medium">Set up assessments:</span>{" "}
            Visit <strong>Manage Assessments</strong> to create tests and quizzes
            that reinforce learning.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InstructorHome;
