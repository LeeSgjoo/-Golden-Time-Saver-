FROM tomcat:9.0
ADD target/*.war /usr/local/tomcat/webapps/
CMD ["catalina.sh", "run"]
#localhost3306:3306/gts_project