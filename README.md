# Travellion - Tour Planning, Booking and Traveling Process Management System

## 🌴 Overview

Travellion is a comprehensive tourism management system designed to revolutionize Sri Lanka's travel industry. This integrated platform streamlines tour planning, booking processes, and travel management for administrators, service providers, and tourists alike.

## 🎯 Project Objectives

- **Enhance Tourism Efficiency**: Simplify tour planning for both locals and international visitors
- **Digital Transformation**: Replace manual operations with automated solutions to reduce errors
- **Centralized Communication**: Improve coordination among all tourism stakeholders
- **Data-Driven Decisions**: Provide insightful analytics and reports for better decision-making
- **Economic Growth**: Support Sri Lanka's tourism sector development and socio-economic progress

## 🚀 Key Features

### Core Functionality
- **Travel Location Management**: Comprehensive database of tourist destinations
- **Hotel Registration & Management**: Complete hotel booking and reservation system
- **Vehicle Management**: Fleet and supplier management for transportation
- **Tour Planning**: Customizable tour packages and itinerary planning
- **Booking System**: Integrated hotel, flight, and ticket reservations
- **Payment Processing**: Secure client and vendor payment management
- **Reporting**: Arrival/departure reports and analytics

### User Management
- Customer registration and profiles
- Tour guide and crew assignment
- Location agent management
- Passenger management system

## 🏗️ System Architecture

### Technology Stack
- **Backend (Spring-Boot)**: Java (JDK 17)
- **Frontend (Angular 20.1.7)**: Node.js (v20.15.1 ^)
- **Database**: MySQL Server 8.0.31
- **Development Environment**: IntelliJ IDEA 2025
- **API Testing**: Postman
- **Containerization**: Docker

### System Requirements

#### Development Environment
- **CPU**: Intel Core i5-11300H @ 3.10GHz or equivalent
- **RAM**: 32 GB (recommended)
- **Storage**: 1.5 TB NVMe SSD
- **OS**: Windows 11

#### Production Server
- **CPU**: Intel Core i3 or higher
- **RAM**: Minimum 16 GB
- **Storage**: Minimum 100 GB
- **Database**: MySQL 8.0.31

#### Client Requirements
- **CPU**: Intel Core i5 or equivalent
- **RAM**: Minimum 8 GB
- **Storage**: Minimum 256 GB
- **Browser**: JavaScript-enabled (Chrome, Edge, Firefox)

## 📋 Project Scope

### Included Features
✅ Travel location management  
✅ Hotel registration and booking  
✅ Vehicle supplier management  
✅ Tour planning and packages  
✅ Reservation systems  
✅ Payment processing  
✅ Reporting and analytics

### Out of Scope
❌ Airline ticket booking  
❌ Currency exchange services  
❌ Visa processing  
❌ Automated tour suggestions

## 🔧 Installation & Setup

### Prerequisites
```bash
# Java JDK 17
java -version

# Node.js v20.15.1
node --version

# MySQL Server
mysql --version
```

### Getting Started
1. **Clone the repository**
   ```bash
   git clone https://github.com/Dileesha-Ekanayake/TravellionServer_Final-Project
   cd travellion
   ```

2. **Database Setup**
   ```bash
   # Create database and import schema
   mysql -u root -p < database/db_backup.sql
   ```

3. **Backend Setup**
   ```bash
   # Navigate to backend directory
   cd backend
   # Install dependencies and run
   ./mvnw spring-boot:run
   ```

4. **Frontend Setup**
   ```bash
   # Navigate to frontend directory
   cd frontend
   npm install
   ng serve
   ```

## 🧪 Testing

The project follows comprehensive testing protocols:
- **Unit Testing**: Individual component testing
- **Integration Testing**: API testing using Postman
- **User Acceptance Testing**: Client validation testing
- **Regression Testing**: Continuous testing during development

## 📊 Development Methodology

This project follows an **Iterative Incremental Development** approach:
1. **Requirements Gathering**: Stakeholder interviews and system analysis
2. **System Design**: Incremental architecture and UI/UX design
3. **Development**: Modular feature development
4. **Testing**: Comprehensive testing at each iteration

## 🎓 Academic Context

This project was developed as part of the **IT5106 - Software Development Project** at University of Colombo School of Computing (UCSC).

## 📞 Contact

**Developer**: Dileesha Ekanayake  
**Email**: dileesha.r.ekanayake@gmail.com  
**Phone**: +94 76 83 48 418

## 🤝 Contributing

This is an academic project, but contributions and suggestions are welcome for educational purposes.

## 📄 License

This project is developed for academic purposes as part of a university degree program.

---

*Empowering Sri Lanka's tourism industry through innovative digital solutions.*
