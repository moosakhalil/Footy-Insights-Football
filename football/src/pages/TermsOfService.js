import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PageStyles.css';

const TermsOfService = () => {
  return (
    <div className="page-container">
      {/* Back to Home Button */}
      <Link to="/" className="back-to-home" title="Back to Home">
        <ArrowLeft />
      </Link>
      
      <div className="page-header">
        <h1>Terms of Service</h1>
        <div className="page-header-line"></div>
      </div>
      
      <div className="page-content">
        <div className="policy-section">
          <p className="last-updated">Last Updated: November 1, 2023</p>
          
          <section className="policy-item">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using Footy Insights (the "Service"), you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
              from using or accessing this site.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on Footy Insights's website for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and 
              under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose or for any public display;</li>
              <li>Attempt to reverse engineer any software contained on Footy Insights's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
            <p>
              This license shall automatically terminate if you violate any of these restrictions and may be 
              terminated by Footy Insights at any time.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>3. User Accounts</h2>
            <p>
              When you create an account with us, you guarantee that the information you provide us is accurate, 
              complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the 
              immediate termination of your account on the Service.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account and password, including but 
              not limited to the restriction of access to your computer and/or account. You agree to accept 
              responsibility for any and all activities or actions that occur under your account and/or password.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>4. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, 
              text, graphics, videos, or other material. You are responsible for the content that you post on or 
              through the Service, including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting content on or through the Service, You represent and warrant that: (i) the content is yours 
              and/or you have the right to use it and the right to grant us the rights and license as provided in 
              these Terms, and (ii) that the posting of your content on or through the Service does not violate the 
              privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>5. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding content provided by users), features, and functionality 
              are and will remain the exclusive property of Footy Insights and its licensors. The Service is protected 
              by copyright, trademark, and other laws of both Pakistan and foreign countries. Our trademarks and trade 
              dress may not be used in connection with any product or service without the prior written consent of 
              Footy Insights.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>6. Prohibited Activities</h2>
            <p>You may not access or use the Service for any purpose other than that for which we make the Service available. The Service may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
            <p>As a user of the Service, you agree not to:</p>
            <ul>
              <li>Systematically retrieve data or other content from the Service to create or compile, directly or indirectly, a collection, compilation, database, or directory.</li>
              <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the Service.</li>
              <li>Engage in unauthorized framing of or linking to the Service.</li>
              <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
            </ul>
          </section>
          
          <section className="policy-item">
            <h2>7. Limitation of Liability</h2>
            <p>
              In no event shall Footy Insights, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access 
              to or use of or inability to access or use the Service.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>8. Disclaimer</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. 
              The Service is provided without warranties of any kind, whether express or implied, including, but not limited 
              to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>9. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of Pakistan, without regard to its 
              conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered 
              a waiver of those rights.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
              material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a 
              material change will be determined at our sole discretion.
            </p>
          </section>
          
          <section className="policy-item">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="contact-email">terms@footyinsights.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 