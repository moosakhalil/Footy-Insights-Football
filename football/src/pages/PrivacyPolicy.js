import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PageStyles.css';

const PrivacyPolicy = () => {
  return (
    <div className="page-container">
      {/* Back to Home Button */}
      <Link to="/" className="back-to-home" title="Back to Home">
        <ArrowLeft />
      </Link>
      
      <div className="page-header">
        <h1>Privacy Policy</h1>
        <div className="page-header-line"></div>
      </div>
      
      <div className="page-content">
        <div className="policy-section">
          <div className="policy-image-container">
            <img 
              src="/PrivacyPolicy .jpg" 
              alt="Privacy and Data Protection" 
              className="policy-header-image"
            />
          </div>
          
          <p className="last-updated">Last Updated: November 1, 2023</p>
          
          <section className="policy-item">
            <h2>1. Introduction</h2>
            <p>
              At Footy Insights ("we", "our", or "us"), we are committed to protecting your privacy and personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              website and services. Please read this privacy policy carefully. If you do not agree with the terms of this 
              privacy policy, please do not access the site.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Data</h3>
            <p>
              We may collect personal information that you voluntarily provide to us when you register with us, 
              express an interest in obtaining information about us or our products and services, participate in 
              activities on the Site or otherwise contact us. The personal information we collect may include:
            </p>
            <ul>
              <li>Name and contact data (such as email address, phone number)</li>
              <li>Credentials (password and similar security information used for authentication and account access)</li>
              <li>Demographic information (such as your country)</li>
              <li>Any other information you choose to provide</li>
            </ul>
            
            <h3>2.2 Automatically Collected Information</h3>
            <p>
              When you use our Site, we automatically collect certain information about your device, including 
              information about your web browser, IP address, time zone, and some of the cookies that are installed 
              on your device. Additionally, as you browse the Site, we collect information about the individual web pages 
              that you view, what websites or search terms referred you to the Site, and information about how you 
              interact with the Site.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul>
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you to provide you with updates and other information</li>
              <li>Send you emails and notifications</li>
              <li>Find and prevent fraud</li>
            </ul>
          </section>
          
          <section className="policy-item">
            <h2>4. Sharing Your Information</h2>
            <p>
              We may share your information with third parties in certain situations. For example, 
              we may share your data with service providers to perform services on our behalf, 
              business partners with whom we jointly offer products or services, or when required by law.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track the activity on our Site and store 
              certain information. You can instruct your browser to refuse all cookies or to indicate when a 
              cookie is being sent. However, if you do not accept cookies, you may not be able to use some 
              portions of our Site.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>6. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect 
              the security of any personal information we process. However, please also remember that we cannot 
              guarantee that the internet itself is 100% secure.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>7. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, 
              such as the right to request access, correction, or deletion of your data, or to object to our 
              processing of your data.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically 
              for any changes.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="contact-email">privacy@footyinsights.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 