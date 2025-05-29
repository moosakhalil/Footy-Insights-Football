import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PageStyles.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });

  const [activeTab, setActiveTab] = useState('general');
  const [faqOpen, setFaqOpen] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus({
      submitted: true,
      error: false,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });
    
    // Reset form after successful submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // FAQ items
  const faqItems = [
    {
      question: "How quickly can I expect a response to my inquiry?",
      answer: "We aim to respond to all inquiries within 24-48 hours during business days. For urgent matters, please contact us directly by phone."
    },
    {
      question: "Do you offer customer support for technical issues?",
      answer: "Yes, our technical team is available to help with any issues you might experience with our platform. Please provide detailed information about the problem when contacting us."
    },
    {
      question: "Can I request custom features for the platform?",
      answer: "Absolutely! We welcome feature requests and feedback from our users. Please use the contact form with the 'Feature Request' subject to send us your ideas."
    },
    {
      question: "How do I report incorrect match data or statistics?",
      answer: "Data accuracy is important to us. If you notice any discrepancies, please report them through our contact form with the subject 'Data Correction'."
    }
  ];

  return (
    <div className="page-container">
      {/* Back to Home Button */}
      <Link to="/" className="back-to-home" title="Back to Home">
        <ArrowLeft />
      </Link>
      
      <div className="page-header">
        <h1>Contact Us</h1>
        <div className="page-header-line"></div>
      </div>
      
      <div className="page-content">
        <div className="contact-hero">
          <div className="contact-info-container">
            <h2>Get In Touch</h2>
            <p className="contact-intro">
              Have questions or feedback? We'd love to hear from you. Our team is always ready to assist with any inquiries about our platform, services, or football data.
            </p>
            
            <div className="contact-cards">
              <div className="contact-card">
                <div className="contact-icon">
                  <Mail size={22} />
                </div>
                <div className="contact-details">
                  <h3>Email Us</h3>
                  <p>info@footyinsights.com</p>
                  <p>support@footyinsights.com</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <Phone size={22} />
                </div>
                <div className="contact-details">
                  <h3>Call Us</h3>
                  <p>+92 300 1234567</p>
                  <p>+92 321 9876543</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <Clock size={22} />
                </div>
                <div className="contact-details">
                  <h3>Business Hours</h3>
                  <p>Monday-Friday: 9am-5pm</p>
                  <p>Weekend: Closed</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <MapPin size={22} />
                </div>
                <div className="contact-details">
                  <h3>Visit Us</h3>
                  <p>45 Sports Complex</p>
                  <p>Islamabad, Pakistan</p>
                </div>
              </div>
            </div>
          </div>
            
          <div className="contact-map-container">
            <div className="contact-map">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212645.58469137298!2d72.99861354540922!3d33.61611318773258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbfd07891722f%3A0x6059515c3bdb02b6!2sIslamabad%2C%20Islamabad%20Capital%20Territory%2C%20Pakistan!5e0!3m2!1sen!2s!4v1668504016129!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              ></iframe>
            </div>
          </div>
        </div>
        
        <div className="contact-form-section">
          <div className="contact-form-header">
            <h2>Send Us a Message</h2>
            <div className="contact-tabs">
              <button 
                className={`contact-tab ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                General Inquiry
              </button>
              <button 
                className={`contact-tab ${activeTab === 'support' ? 'active' : ''}`}
                onClick={() => setActiveTab('support')}
              >
                Technical Support
              </button>
              <button 
                className={`contact-tab ${activeTab === 'business' ? 'active' : ''}`}
                onClick={() => setActiveTab('business')}
              >
                Business Inquiry
              </button>
            </div>
          </div>
           
          {formStatus.submitted ? (
            <div className={`form-message ${formStatus.error ? 'error' : 'success'}`}>
              {formStatus.message}
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Your Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={`${activeTab === 'general' ? 'What is your inquiry about?' : 
                                activeTab === 'support' ? 'What issue are you experiencing?' : 
                                'Tell us about your business inquiry'}`}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5" 
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please provide details about your inquiry..."
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                <Send size={16} />
                Send Message
              </button>
            </form>
          )}
        </div>
        
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqItems.map((faq, index) => (
              <div key={index} className={`faq-item ${faqOpen === index ? 'open' : ''}`}>
                <div 
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <h3>{faq.question}</h3>
                  {faqOpen === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;