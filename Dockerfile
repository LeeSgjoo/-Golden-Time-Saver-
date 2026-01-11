# 1. 실행 환경 설정 (Java 8 버전으로 변경)
FROM eclipse-temurin:8-jre

# 2. 작업 디렉토리 생성
WORKDIR /app

# 3. 빌드된 WAR 파일을 컨테이너 내부로 복사
# 프로젝트 이름에 맞춰 경로를 확인하세요.
COPY target/gts_project-1.0-SNAPSHOT.war app.war

# 4. 포트 설정
EXPOSE 8080

# 5. 서버 실행 (DataSource 설정을 명령어로 직접 주입하는 것이 가장 확실합니다)
ENTRYPOINT ["java", "-jar", "app.war", \
"--spring.datasource.url=jdbc:mariadb://localhost:3306/gts?createDatabaseIfNotExist=true", \
"--spring.datasource.username=root", \
"--spring.datasource.password=1234"]