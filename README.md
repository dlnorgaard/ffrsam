# ffRSAM

ffRSAM is a web-based application to allow users to view plots of pre-calculated Real-time Seismic-Amplitude Measurement (RSAM) and frequency filtered (ff) RSAM.  The system has a back-end Python script run by cron jobs to retrieve trace data from a wave server (e.g. Winston), calculate RSAM and ff RSAM based on pre-determined frequency bands, and store the calculated values in a MariaDB database.  The front-end, or user interface, is a web-application written in plain HTML and JavaScript. REST API written in PHP is used to query the database.

# System Requirements
Python 3
PHP 7
MySQL 5

The ffRSAM application has been developed and tested on CentOS 7 Linux platform and the instructions here are written for this operating system.  However, the programming languages used are platform independent and should run on any operating system with minor modifications to the instructions.  The instructions also assume installation of the Python scripts, MariaDB database, and Apache web server will be on the same server, though they are not required to be.  

# Installation Instructions

## Database Installation
1)	Install MariaDB (or MySQL) if it is not already installed.
a)	Install MariaDB Server:
yum install mariadb-server
b)	Enable MariaDB to start on boot; start MariaDB:
systemctl enable mariadb
systemctl start mariadb
c)	Create MySQL root password (replace newpassword with another password):
mysqladmin -u root password 'newpassword' 
2)	Create rsam schema and objects (rsam.sql in sql folder):
a)	mysql -u root -p < rsam.sql
Following objects will be created:
Table:  channels 
This table stores a summary of what data RSAM values are calculated for.  It stores the SCNL channel name, the period (in seconds), start time, end time, low pass value of frequency band, and high pass value of frequency band. The start time and end times denote when the RSAM values for this channel period and band was first and last calculated.
MariaDB [rsam]> describe channels;
+------------+-------------+------+-----+---------------------+----------------+
| Field      | Type        | Null | Key | Default             | Extra          |
+------------+-------------+------+-----+---------------------+----------------+
| cid        | int(11)     | NO   | PRI | NULL                | auto_increment |
| channel    | varchar(15) | NO   |     | NULL                |                |
| period     | int(11)     | NO   | MUL | NULL                |                |
| start_time | timestamp   | NO   |     | 0000-00-00 00:00:00 |                |
| end_time   | timestamp   | NO   |     | 0000-00-00 00:00:00 |                |
| f1         | float       | NO   |     | 0                   |                |
| f2         | float       | NO   |     | 0                   |                |
+------------+-------------+------+-----+---------------------+----------------+

Table: rsam

MariaDB [rsam]> describe rsam;
+----------+-----------+------+-----+-------------------+-----------------------------+
| Field    | Type      | Null | Key | Default           | Extra                       |
+----------+-----------+------+-----+-------------------+-----------------------------+
| id       | int(11)   | NO   | PRI | NULL              | auto_increment              |
| cid      | int(11)   | NO   | MUL | NULL              |                             |
| end_time | timestamp | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
| value    | double    | NO   |     | NULL              |                             |
+----------+-----------+------+-----+-------------------+-----------------------------+

3)	Create user for accessing rsam database. Replace ‘password’ with rsamuser password:
mysql -u root -p
mysql> CREATE USER 'rsamuser'@'localhost' IDENTIFIED BY 'password'; 
mysql> GRANT ALL PRIVILEGES ON *.* TO 'rsamuser'@'localhost' WITH GRANT OPTION;
mysql> flush privileges;
 

