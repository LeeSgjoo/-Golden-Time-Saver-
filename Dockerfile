# 1. 실행 환경 설정 (Java 11 기준, 프로젝트 버전에 맞춰 수정)
FROM openjdk:11-jre-slim

# 2. 작업 디렉토리 생성
WORKDIR /app

# 3. 빌드된 파일 복사 (target 폴더에 생성된 파일명 확인)
COPY target/*.war app.war

# 4. PaaS 환경에서 포트를 유연하게 잡기 위한 설정
# (내장 톰캣 사용 시 스프링이 PORT 환경변수를 인식함)
ENV PORT 8080
EXPOSE 8080

# 5. 실행 명령
# -Dserver.port는 PaaS가 지정해주는 포트로 서버를 띄우기 위함
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.war"]