'use client';

import { useState } from 'react';
import axios from 'axios';
import TextFormInput from '@/components/from/TextFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const AgentAdd = () => {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const messageSchema = yup.object({
    name: yup.string().required('Please enter name'),
    email: yup.string().email().required('Please enter email'),
    password: yup.string().required('Please enter password'),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm password'),
  });

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(messageSchema),
  });

  const onSubmit = async (data) => {
    alert("hello")
    setMessage(null);
    setError(null);
    console.log("Submitting data:", data); // Debugging: Check form data before sending
    
    const requestData = {
      ...data,
      // admin_unique_id: "xteaz5" // Replace with dynamic admin ID if needed
      instructor_unique_id: "rc8v5o"
    };
    try {
      const response = await axios.post('https://twpwlfdg-5000.inc1.devtunnels.ms/register', requestData, {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage(response.data.message || 'Instructor added successfully!');
      reset();
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">Add Members Information</CardTitle>
        </CardHeader>
        <CardBody>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="name" placeholder="Full Name" label=" Name" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="role" placeholder="Enter the  Role" label="Role" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="group_name" placeholder="enter the  Group" label=" Group Name" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="email" placeholder="Enter Email" label=" Email" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="password" type="password" placeholder="Enter Password" label="Enter Password" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="confirmPassword" type="password" placeholder="Confirm Password" label="Confirm Password" />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button type="submit" variant="outline-primary" className="w-100">
              Create Member
            </Button>
          </Col>
          <Col lg={2}>
            <Button variant="danger" className="w-100" onClick={() => reset()}>
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  );
};

export default AgentAdd;
