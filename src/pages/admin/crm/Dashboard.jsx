import MainLayout from "../../../components/layout/MainLayout";
import { Card, Row, Col } from "react-bootstrap";
import { MdTrendingUp, MdPeople, MdAssignment, MdCheckCircle } from "react-icons/md";

const Dashboard = () => {
  const stats = [
    { title: "Total Customers", value: "1,234", icon: <MdPeople size={32} />, color: "primary" },
    { title: "Active Tickets", value: "45", icon: <MdAssignment size={32} />, color: "warning" },
    { title: "Resolved Issues", value: "892", icon: <MdCheckCircle size={32} />, color: "success" },
    { title: "Growth", value: "+12%", icon: <MdTrendingUp size={32} />, color: "info" },
  ];

  return (
    <MainLayout title="CRM Dashboard" role="admin">
      <h2 className="mb-4">CRM Dashboard</h2>
      <p className="text-muted mb-4">Welcome to your Customer Relationship Management Dashboard</p>
      
      <Row className="g-4">
        {stats.map((stat, index) => (
          <Col lg={3} md={6} sm={12} key={index}>
            <Card className="stat-card h-100 shadow-sm">
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-2">{stat.title}</p>
                  <h4 className="mb-0">{stat.value}</h4>
                </div>
                <div className={`stat-icon text-${stat.color}`}>
                  {stat.icon}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-5">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">No recent activities yet.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default Dashboard;
