import MainLayout from "../../../components/layout/MainLayout";
import { Card, Row, Col } from "react-bootstrap";
import { MdShoppingCart, MdLocalOffer, MdTrendingUp, MdAccessTime } from "react-icons/md";

const Dashboard = () => {
  const stats = [
    { title: "Total Sales", value: "$45,231", icon: <MdShoppingCart size={32} />, color: "success" },
    { title: "Deals in Pipeline", value: "28", icon: <MdLocalOffer size={32} />, color: "primary" },
    { title: "Conversion Rate", value: "24%", icon: <MdTrendingUp size={32} />, color: "info" },
    { title: "Avg Deal Duration", value: "15 days", icon: <MdAccessTime size={32} />, color: "warning" },
  ];

  return (
    <MainLayout title="Sales Dashboard" role="admin">
      <h2 className="mb-4">Sales Dashboard</h2>
      <p className="text-muted mb-4">Sales Management & Analytics Dashboard</p>
      
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
              <h5 className="mb-0">Recent Deals</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">No deals yet.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default Dashboard;
