import MainLayout from "../../components/layout/MainLayout";
import { Card, Row, Col, Button } from "react-bootstrap";
import { MdReceipt, MdNotifications, MdHelpOutline } from "react-icons/md";

const Dashboard = () => {
  const quickLinks = [
    { title: "Invoices", count: "5", icon: <MdReceipt size={28} />, link: "/customer/invoices" },
    { title: "Notifications", count: "3", icon: <MdNotifications size={28} />, link: "/customer/notifications" },
    { title: "Support Tickets", count: "2", icon: <MdHelpOutline size={28} />, link: "/customer/tickets" },
  ];

  return (
    <MainLayout title="Customer Dashboard" role="customer">
      <h2 className="mb-4">Welcome to Your Dashboard</h2>
      <p className="text-muted mb-4">Manage your account and services</p>
      
      <Row className="g-4">
        {quickLinks.map((link, index) => (
          <Col lg={4} md={6} sm={12} key={index}>
            <Card className="quick-link-card h-100 shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3 text-primary" style={{ fontSize: "32px" }}>
                  {link.icon}
                </div>
                <h5 className="mb-2">{link.title}</h5>
                <p className="text-muted mb-3">{link.count} items</p>
                <Button variant="outline-primary" size="sm" href={link.link}>
                  View All
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-5">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Recent Orders</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">No recent orders.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default Dashboard;
