import { useState } from "react";
import api from "../utils/axios";

export default function CourseForm({ onCourseSave }) {
  const [course, setCourse] = useState({
    title: "",
    category: "",
    description: "",
    thumbnail: "",
    price: 0,
    skillsInput: [""],
    learningPointsInput: [""],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "skillsInput" | "learningPointsInput",
    index: number
  ) => {
    const newArr = [...course[field]];
    newArr[index] = e.target.value;
    setCourse((prev) => ({ ...prev, [field]: newArr }));
  };

  const handleFileChange = (e) => {
    const file = e.target?.files[0] || null;
    if (file) {
      setCourse((prev) => ({...prev, thumbnail: file}));
      console.log("Selected file:", file);
    }
  };

  const addArrayItem = (field: "skillsInput" | "learningPointsInput") => {
    setCourse((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting course:", course);
    try{
      const formData = new FormData();
      formData.append("title", course.title);
      formData.append("category_id", String(course.category));
      formData.append("description", course.description);
      formData.append("price", String(course.price));

      if (course.thumbnail) {
        formData.append("thumbnail", course.thumbnail);
      }

      course.skillsInput.forEach((skill) =>
        formData.append(`skills_input`, skill)
      );

      course.learningPointsInput.forEach((point) =>
        formData.append(`learning_points_input`, point)
      );

      const response = await api.post(`/api/courses/create/`, formData, {
        headers: {"Content-Type": "multipart/form-data"},
      })
      const data = response.data;
      console.log(data);
      setCourse({
        title: "",
        category: "",
        description: "",
        thumbnail: "",
        price: 0,
        skillsInput: [""],
        learningPointsInput: [""],
      });

      // Handle after save
      onCourseSave();

    }catch(err: any){
      const { data } = err.response;
      console.error(data);
    }
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
            type="file" 
            accept="image/*"
            className="w-full border rounded-lg p-2"
            onChange={handleFileChange}
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
          {course.skillsInput.map((skill, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Skill ${i + 1}`}
              value={skill}
              onChange={(e) => handleArrayChange(e, "skillsInput", i)}
              className="w-full border rounded-lg p-2 mb-2"
            />
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("skillsInput")}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Skill
          </button>
        </div>

        {/* Learning Points */}
        <div>
          <h3 className="font-semibold mb-2">Learning Points</h3>
          {course.learningPointsInput.map((point, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Learning Point ${i + 1}`}
              value={point}
              onChange={(e) => handleArrayChange(e, "learningPointsInput", i)}
              className="w-full border rounded-lg p-2 mb-2"
            />
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("learningPointsInput")}
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
