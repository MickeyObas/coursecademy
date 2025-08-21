import { useState } from "react";

export default function CourseForm() {
  const [course, setCourse] = useState({
    title: "",
    category: "",
    description: "",
    thumbnail: "",
    price: 0,
    skills: [""],
    learningPoints: [""],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "skills" | "learningPoints",
    index: number
  ) => {
    const newArr = [...course[field]];
    newArr[index] = e.target.value;
    setCourse((prev) => ({ ...prev, [field]: newArr }));
  };

  const addArrayItem = (field: "skills" | "learningPoints") => {
    setCourse((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting course:", course);
    // TODO: send to backend
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white shadow-md rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Create a New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Course Title"
            value={course.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={course.category}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
          <textarea
            name="description"
            placeholder="Course Description"
            value={course.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
          <input
            type="text"
            name="thumbnail"
            placeholder="Thumbnail URL"
            value={course.thumbnail}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={course.price}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Skills */}
        <div>
          <h3 className="font-semibold mb-2">Course Skills</h3>
          {course.skills.map((skill, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Skill ${i + 1}`}
              value={skill}
              onChange={(e) => handleArrayChange(e, "skills", i)}
              className="w-full border rounded-lg p-2 mb-2"
            />
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("skills")}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Skill
          </button>
        </div>

        {/* Learning Points */}
        <div>
          <h3 className="font-semibold mb-2">Learning Points</h3>
          {course.learningPoints.map((point, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Learning Point ${i + 1}`}
              value={point}
              onChange={(e) => handleArrayChange(e, "learningPoints", i)}
              className="w-full border rounded-lg p-2 mb-2"
            />
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("learningPoints")}
            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Learning Point
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Save Course
        </button>
      </form>
    </div>
  );
}
