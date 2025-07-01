import React from "react";
import { Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "./ClientSidebar";
import jollibeeImg from "../../assets/Jollibee.png";
import ITbytesImg from "../../assets/ITBYTES.png";
import NationalBImg from "../../assets/NationalB.jpeg";
import BlendedImg from "../../assets/Blended.jpg";
import TaraLabaImg from "../../assets/taraLaba.png";
import PNBImg from "../../assets/PNB.png";

const cardData = [
  {
    title: "Jollibee",
    image: jollibeeImg,
    url: "http://192.168.9.37:5173/",
  },
  {
    title: "Blended",
    image: BlendedImg,
    url: "http://192.168.9.7:5173/",
  },
  {
    title: "National Bookstore",
    image: NationalBImg,
    url: "http://192.168.9.16:5173/",
  },
  {
    title: "TaraLaba",
    image: TaraLabaImg,
    url: "http://192.168.9.27:5173/",
  },
  {
    title: "ITBYTES",
    image: ITbytesImg,
    url: "http://192.168.9.4:5173/",
  },
  {
    title: "PNB",
    image: PNBImg,
    url: "http://192.168.9.23:5173/",
  },
];

function OtherPlatform() {
  const navigate = useNavigate();

  const handleCardClick = (url) => {
    if (/^https?:\/\//.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      navigate(url);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar with fixed width */}
      <div style={{ width: 220 }}>
        <ClientSidebar />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Row gutter={[24, 24]}>
          {cardData.map((card, idx) => (
            <Col xs={24} sm={12} md={8} lg={6} key={idx}>
              <Card
                hoverable
                cover={<img alt={card.title} src={card.image} />}
                onClick={() => handleCardClick(card.url)}
                style={{ cursor: "pointer", height: "100%" }}
              >
                <Card.Meta title={card.title} description={card.description} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

export default OtherPlatform;
