import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi everyone! I’m <span className="purple">Shyam Kumar</span>{" "}
            from <span className="purple">Hazaribagh,Jharkhnad, India</span>.
            <br />
            I’m currently pursuing{" "}
            <span className="purple">B.Tech</span> at{" "}
            <span className="purple">from SRM university</span>.
            <br />with excellent academic performance.{" "}
            <span className="purple">I am passionate about software development, problem-solving, and learning new technologies.</span> from{" "}
            <span className="purple">My career goal is to secure a job in the IT industry as a software developer</span>.
            <br />
            <br />
            Outside of coding, I love engaging in activities that keep me
            creative and inspired:
          </p>

          <ul>
            <li className="about-activity">
              <ImPointRight /> Playing Games 🎮
            </li>
            <li className="about-activity">
              <ImPointRight /> Learing about investing and Finance
            </li>
            <li className="about-activity">
              <ImPointRight /> Traveling and Exploring New Places 🌍
            </li>
          </ul>

          <p style={{ color: "rgb(155 126 172)" }}>
            "Strive to build things that make a difference!"{" "}
          </p>
          <footer className="blockquote-footer">Soumyajit</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
