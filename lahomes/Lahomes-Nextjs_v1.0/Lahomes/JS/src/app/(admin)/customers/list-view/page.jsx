"use client";
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, Row } from "react-bootstrap";
import axios from "axios";

const CustomersListPage = ({ requestData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [students, setStudentData] = useState([]);
  const router = useRouter();
  const id= localStorage.getItem("admin_unique_id");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.post("http://localhost:5000/fecth", {
          admin_unique_id: id
        });

        if (!response.data || !response.data.instructors || !response.data.students) {
          throw new Error("Invalid response format");
        }

        const { instructors, students } = response.data;

        const instructorMap = instructors.reduce((acc, student) => {
          acc[student.students_unique_id] = student.instructor_name;
          return acc;
        }, {});

        const enrichedStudents = students.map(student => ({
          ...student,
          instructor_name: instructorMap[student.students_unique_id] || "Unknown",
        }));

        setStudentData(enrichedStudents);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Error fetching student data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);


  const handleDelete = async (uniqueId, updateUI) => {
    try {
      const response = await fetch('http://localhost:5000/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unique_id: uniqueId }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error('Error:', result.error);
        alert(`Failed to delete: ${result.error}`);
        return;
      }
  
      alert(result.message);
    
      if (typeof updateUI === 'function') {
        updateUI(uniqueId);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('Network error, please try again later.');
    }
  };
    
  
  const removeStudent = (uniqueId) => {
    setStudentData(prev => prev.filter(students => students.student_unique_id!== uniqueId));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

 
  const handleInputChange = (e, field) => {
    setEditedData({
      ...editedData,
      [field]: e.target.value,
    });
  };

  const uniqueGroups = [...new Set(students.map((student) => student.group_name))];

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === "All" || student.group_name === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleGroupFilter = (group) => {
    setSelectedGroup(group);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="border-0">
              <Row className="justify-content-between">
                <Col lg={6}>
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <form className="app-search d-none d-md-block me-auto">
                        <div className="position-relative">
                          <input
                            type="search"
                            className="form-control"
                            value={searchQuery}
                            placeholder="Search Student"
                            autoComplete="off"
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <IconifyIcon icon="solar:magnifer-broken" className="search-widget-icon" />
                        </div>
                      </form>
                    </Col>
                    <Col lg={4}>
                      <h5 className="text-dark fw-medium mb-0">
                        {filteredStudents.length} <span className="text-muted">Students</span>
                      </h5>
                    </Col>
                  </Row>
                </Col>
                <Col lg={6}>
                  <div className="text-md-end mt-3 mt-md-0">
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-primary" id="dropdown-group-filter">
                        Filter by Group
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleGroupFilter("All")}>All</Dropdown.Item>
                        {uniqueGroups.map((group, idx) => (
                          <Dropdown.Item key={idx} onClick={() => handleGroupFilter(group)}>
                            {group}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </Col>
              </Row>
            </CardHeader>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <CardTitle as={"h4"}>All Students List</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <div className="table-responsive">
                <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Group</th>
                      <th>Unique Id</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, idx) => (
                      <tr key={idx}>
                        <td>
                          {editingId === student.students_unique_id ? (
                            <input
                              type="text"
                              value={editedData.student_name || ""}
                              onChange={(e) => handleInputChange(e, "student_name")}
                              className="form-control"
                            />
                          ) : (
                            student.student_name
                          )}
                        </td>
                        <td>
                          {editingId === student.students_unique_id ? (
                            <input
                              type="text"
                              value={editedData.student_email || ""}
                              onChange={(e) => handleInputChange(e, "student_email")}
                              className="form-control"
                            />
                          ) : (
                            student.student_email
                          )}
                        </td>
                        <td>
                          {editingId === student.students_unique_id ? (
                            <input
                              type="text"
                              value={editedData.password || ""}
                              onChange={(e) => handleInputChange(e, "password")}
                              className="form-control"
                            />
                          ) : (
                            student.password
                          )}
                        </td>
                        <td>
                          {editingId === student.students_unique_id ? (
                            <input
                              type="text"
                              value={editedData.group_name || ""}
                              onChange={(e) => handleInputChange(e, "group_name")}
                              className="form-control"
                            />
                          ) : (
                            student.group_name
                          )}
                        </td>
                        <td>
                          {editingId === student.students_unique_id ? (
                            <input
                              type="text"
                              value={editedData.students_unique_id || ""}
                              onChange={(e) => handleInputChange(e, "students_unique_id")}
                              className="form-control"
                            />
                          ) : (
                            student.student_unique_id
                          )}
                        </td>
                        <td>{(student.created_at)}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              student.status === "Active" ? "success" : "danger"
                            }-subtle text-${student.status === "Active" ? "success" : "danger"} py-1 px-2 fs-13`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="light" size="sm">
                              <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                            </Button>
                            {editingId === student.students_unique_id ? (
                              <Button
                                variant="soft-success"
                                size="sm"
                                onClick={() => handleSave(student.students_unique_id)}
                              >
                                <IconifyIcon icon="solar:check-circle-broken" className="align-middle fs-18" />
                              </Button>
                            ) : (
                              <Button
                                variant="soft-primary"
                                size="sm"
                                // onClick={() => handleEdit(student.students_unique_id)}
                              >
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </Button>
                            )}
                            <Button
                              variant="soft-danger"
                              size="sm"
                              onClick={() => handleDelete(student.student_unique_id,removeStudent)}
                            >
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
            <CardFooter>
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={handlePrevPage}>Previous</button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">{currentPage}</span>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={handleNextPage}>Next</button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CustomersListPage;