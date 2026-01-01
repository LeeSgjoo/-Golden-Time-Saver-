# 마이크로 골든타임 체크 (Micro Golden-Time Check)

> 구급대원과 병원 응급실 간의 **직통 가용성 확인** 시스템
> 순수 코드 작성 시간: **15시간 내외**

---

## 1. 프로젝트 개요

### 1.1 핵심 컨셉

기존 '골든타임 세이버' 기획에서 '중앙 센터'와 '복잡한 병원 관리' 기능을 제거하고, **[구급대원 ↔ 병원 응급실]** 간의 **직통 가용성 확인**에만 집중한 미니멀 프로젝트입니다.

### 1.2 핵심 목표

| 역할 | 행동 |
|------|------|
| 구급대원 | 환자 증상을 한 줄로 등록한다 |
| 병원 | 목록을 보고 **수용/거절** 버튼만 누른다 |
| 구급대원 | 결과만 확인하고 이송을 시작한다 |

### 1.3 기술 스택

- **Backend**: Spring MVC + MyBatis
- **Frontend**: JSP + JSTL
- **Database**: MySQL (또는 Oracle)
- **Build**: Maven

---

## 2. 데이터베이스 설계

> 기존 3개 테이블 → **2개로 통합**하여 쿼리 작성 시간 최소화

### 2.1 ERD 개요

```
┌─────────────┐         ┌──────────────────┐
│   members   │         │  emergency_calls │
├─────────────┤         ├──────────────────┤
│ user_id (PK)│◄────────│ requester_id(FK) │
│ password    │         │ hospital_id (FK) │
│ user_name   │         │ call_id (PK)     │
│ user_role   │         │ patient_info     │
└─────────────┘         │ status           │
                        │ reg_date         │
                        └──────────────────┘
```

### 2.2 members (사용자 테이블)

| 컬럼명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| `user_id` | VARCHAR(50) | 아이디 | **PK** |
| `password` | VARCHAR(100) | 비밀번호 | 암호화 권장 |
| `user_name` | VARCHAR(100) | 이름 | 병원명 또는 구조사명 |
| `user_role` | INT | 분류 | 1: 병원, 2: 구조사 |

```sql
CREATE TABLE members (
    user_id VARCHAR(50) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role INT NOT NULL COMMENT '1:병원, 2:구조사'
);
```

### 2.3 emergency_calls (이송 요청 테이블)

| 컬럼명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| `call_id` | INT | 요청 ID | **PK**, Auto Increment |
| `requester_id` | VARCHAR(50) | 요청자 아이디 | **FK** → members |
| `patient_info` | TEXT | 환자 증상/나이 | 간략한 텍스트 |
| `status` | INT | 상태 | 0:대기, 1:수락, 2:거절, 3:완료 |
| `hospital_id` | VARCHAR(50) | 수락한 병원 | **FK** → members, 초기값 NULL |
| `reg_date` | DATETIME | 등록 시간 | DEFAULT NOW() |

```sql
CREATE TABLE emergency_calls (
    call_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id VARCHAR(50) NOT NULL,
    patient_info TEXT NOT NULL,
    status INT DEFAULT 0 COMMENT '0:대기, 1:수락, 2:거절, 3:완료',
    hospital_id VARCHAR(50) DEFAULT NULL,
    reg_date DATETIME DEFAULT NOW(),
    FOREIGN KEY (requester_id) REFERENCES members(user_id),
    FOREIGN KEY (hospital_id) REFERENCES members(user_id)
);
```

### 2.4 테스트 데이터

```sql
-- 병원 계정
INSERT INTO members VALUES ('hospital01', '1234', '서울대병원 응급실', 1);
INSERT INTO members VALUES ('hospital02', '1234', '연세세브란스 응급실', 1);

-- 구급대원 계정
INSERT INTO members VALUES ('emt001', '1234', '김구급 대원', 2);
INSERT INTO members VALUES ('emt002', '1234', '이응급 대원', 2);
```

---

## 3. 페이지 이동 및 기능 플로우

### 3.1 전체 플로우 다이어그램

```
                    ┌──────────────┐
                    │   로그인     │
                    │  /login      │
                    └──────┬───────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
    ┌───────────────┐             ┌───────────────┐
    │  user_role=2  │             │  user_role=1  │
    │   (구급대원)   │             │    (병원)     │
    └───────┬───────┘             └───────┬───────┘
            │                             │
            ▼                             ▼
    ┌───────────────┐             ┌───────────────┐
    │  요청 등록     │             │  대기 목록    │
    │ /request/add  │             │ /hospital/main│
    └───────┬───────┘             └───────┬───────┘
            │                             │
            ▼                             ▼
    ┌───────────────┐             ┌───────────────┐
    │  나의 요청    │             │ [수락]/[거절] │
    │ /request/list │◄────────────│  버튼 클릭    │
    └───────────────┘             └───────────────┘
```

### 3.2 구급대원 플로우

| 단계 | URL | 설명 |
|------|-----|------|
| 1 | `/login` | 자신의 계정으로 로그인 |
| 2 | `/request/add` | 환자 증상 입력 후 '전송' 클릭 |
| 3 | `/request/list` | 내가 보낸 요청의 수락 여부 실시간 확인 |

### 3.3 병원 응급실 플로우

| 단계 | URL | 설명 |
|------|-----|------|
| 1 | `/login` | 병원 계정으로 로그인 |
| 2 | `/hospital/main` | 들어온 모든 요청 리스트 확인 |
| 3 | - | **[수락]** 또는 **[거절]** 버튼 클릭 |

---

## 4. 핵심 기능 명세

### 4.1 로그인 (`/login`)

**Request**
```
POST /login
- user_id: string
- password: string
```

**Logic**
1. DB에서 user_id로 조회
2. 비밀번호 일치 확인
3. 세션에 사용자 정보 저장 (`user_id`, `user_role`, `user_name`)
4. `user_role`에 따라 리다이렉트
   - 병원(1) → `/hospital/main`
   - 구급대원(2) → `/request/list`

### 4.2 요청 등록 (`/request/add`)

**Request**
```
POST /request/add
- patient_info: string (예: "50대 남성, 흉통 호소, 의식 있음")
```

**Logic**
1. 세션에서 `requester_id` 추출
2. `emergency_calls` 테이블에 INSERT
3. `/request/list`로 리다이렉트

### 4.3 나의 요청 목록 (`/request/list`)

**Response**
- 내가 등록한 요청 목록 (최신순)
- 각 요청의 상태 표시:
  - 🟡 대기중 (status=0)
  - 🟢 수락됨 (status=1) + 수락 병원명
  - 🔴 거절됨 (status=2)
  - ⚫ 완료 (status=3)

### 4.4 병원 대기 목록 (`/hospital/main`)

**Response**
- `status=0`인 모든 요청 목록
- 각 요청에 **[수락]** **[거절]** 버튼 표시

### 4.5 상태 변경 (`/hospital/update`)

**Request**
```
POST /hospital/update
- call_id: int
- status: int (1 또는 2)
```

**Logic**
1. 세션에서 `hospital_id` 추출
2. `emergency_calls` 테이블 UPDATE
   - `status` = 요청값
   - `hospital_id` = 세션의 병원 ID (수락인 경우)
3. `/hospital/main`으로 리다이렉트

---

## 5. MyBatis 매퍼 쿼리

### 5.1 MemberMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.goldentime.mapper.MemberMapper">

    <!-- 로그인 -->
    <select id="login" parameterType="map" resultType="MemberVO">
        SELECT user_id, password, user_name, user_role
        FROM members
        WHERE user_id = #{user_id} AND password = #{password}
    </select>

</mapper>
```

### 5.2 CallMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.goldentime.mapper.CallMapper">

    <!-- 요청 등록 -->
    <insert id="insertCall" parameterType="CallVO">
        INSERT INTO emergency_calls (requester_id, patient_info)
        VALUES (#{requester_id}, #{patient_info})
    </insert>

    <!-- 내 요청 목록 (구급대원용) -->
    <select id="getMyCallList" parameterType="string" resultType="CallVO">
        SELECT c.*, m.user_name as hospital_name
        FROM emergency_calls c
        LEFT JOIN members m ON c.hospital_id = m.user_id
        WHERE c.requester_id = #{requester_id}
        ORDER BY c.reg_date DESC
    </select>

    <!-- 대기 목록 (병원용) -->
    <select id="getPendingList" resultType="CallVO">
        SELECT c.*, m.user_name as requester_name
        FROM emergency_calls c
        JOIN members m ON c.requester_id = m.user_id
        WHERE c.status = 0
        ORDER BY c.reg_date ASC
    </select>

    <!-- 상태 업데이트 -->
    <update id="updateStatus" parameterType="map">
        UPDATE emergency_calls
        SET status = #{status},
            hospital_id = #{hospital_id}
        WHERE call_id = #{call_id}
    </update>

</mapper>
```

---

## 6. VO 클래스

### 6.1 MemberVO.java

```java
package com.goldentime.vo;

public class MemberVO {
    private String user_id;
    private String password;
    private String user_name;
    private int user_role;  // 1: 병원, 2: 구조사

    // Getters & Setters
}
```

### 6.2 CallVO.java

```java
package com.goldentime.vo;

import java.util.Date;

public class CallVO {
    private int call_id;
    private String requester_id;
    private String patient_info;
    private int status;  // 0:대기, 1:수락, 2:거절, 3:완료
    private String hospital_id;
    private Date reg_date;

    // JOIN용 추가 필드
    private String hospital_name;   // 병원명
    private String requester_name;  // 요청자명

    // Getters & Setters
}
```

---

## 7. 15시간 개발 타임라인

| 시간 | 작업 내용 | 상세 |
|------|----------|------|
| **1~2h** | DB 세팅 및 VO 생성 | 테이블 2개 생성, `MemberVO`, `CallVO` 작성 |
| **3~6h** | MyBatis 매퍼 작성 | `insertCall`, `getCallList`, `updateStatus` 등 쿼리 작성 |
| **7~10h** | Controller/Service 구현 | 로그인 세션 처리, 상태 변경 로직 |
| **11~13h** | UI 이식 및 데이터 연결 | HTML → JSP, `${list}`로 데이터 출력 |
| **14~15h** | 테스트 및 예외 처리 | 로그인 체크, 버그 수정 |

### 7.1 단계별 체크리스트

#### Phase 1: DB & VO (1~2h)
- [ ] MySQL 테이블 2개 생성
- [ ] 테스트 데이터 INSERT
- [ ] MemberVO.java 작성
- [ ] CallVO.java 작성

#### Phase 2: MyBatis (3~6h)
- [ ] mybatis-config.xml 설정
- [ ] MemberMapper.xml 작성
- [ ] CallMapper.xml 작성
- [ ] DAO 클래스 작성

#### Phase 3: Controller/Service (7~10h)
- [ ] LoginController 구현
- [ ] RequestController 구현 (구급대원용)
- [ ] HospitalController 구현 (병원용)
- [ ] 세션 인터셉터 구현

#### Phase 4: UI (11~13h)
- [ ] login.jsp
- [ ] request_form.jsp (요청 등록)
- [ ] request_list.jsp (나의 요청)
- [ ] hospital_main.jsp (대기 목록)

#### Phase 5: 마무리 (14~15h)
- [ ] 로그인 안 된 사용자 접근 차단
- [ ] 상태별 색상 표시
- [ ] 전체 플로우 테스트

---

## 8. 개발 팁

### 8.1 시간 단축 전략

#### 이미지 업로드 생략
시간 단축을 위해 환자 사진 업로드 로직은 제거하고 **텍스트 정보에만 집중**

#### 단일 JSP 페이지 활용
병원용/구급대원용 페이지를 따로 만들지 말고, **한 페이지에서 `c:if`로 분기**

```jsp
<!-- list.jsp 예시 -->
<c:if test="${sessionScope.user.user_role == 1}">
    <!-- 병원용: 수락/거절 버튼 표시 -->
    <button onclick="accept(${call.call_id})">수락</button>
    <button onclick="reject(${call.call_id})">거절</button>
</c:if>

<c:if test="${sessionScope.user.user_role == 2}">
    <!-- 구급대원용: 상태만 표시 -->
    <span class="status-${call.status}">${statusText}</span>
</c:if>
```

### 8.2 기존 프로젝트 재활용

| 기존 코드 | 활용 방안 |
|----------|----------|
| `upload_form.jsp` | → `request_form.jsp`로 변환 |
| `list.jsp` | → 요청 목록 페이지로 변환 |
| `LoginController` | → 세션 처리 로직 재사용 |
| `Interceptor` | → 로그인 체크 로직 재사용 |

### 8.3 상태 표시 CSS

```css
.status-0 { background: #FEF3C7; color: #92400E; } /* 대기 - 노랑 */
.status-1 { background: #D1FAE5; color: #065F46; } /* 수락 - 초록 */
.status-2 { background: #FEE2E2; color: #991B1B; } /* 거절 - 빨강 */
.status-3 { background: #E5E7EB; color: #374151; } /* 완료 - 회색 */
```

---

## 9. 프로젝트 구조

```
src/
├── main/
│   ├── java/com/goldentime/
│   │   ├── controller/
│   │   │   ├── LoginController.java
│   │   │   ├── RequestController.java
│   │   │   └── HospitalController.java
│   │   ├── service/
│   │   │   ├── MemberService.java
│   │   │   └── CallService.java
│   │   ├── dao/
│   │   │   ├── MemberDAO.java
│   │   │   └── CallDAO.java
│   │   ├── vo/
│   │   │   ├── MemberVO.java
│   │   │   └── CallVO.java
│   │   └── interceptor/
│   │       └── LoginInterceptor.java
│   ├── resources/
│   │   ├── mybatis-config.xml
│   │   └── mapper/
│   │       ├── MemberMapper.xml
│   │       └── CallMapper.xml
│   └── webapp/
│       └── WEB-INF/
│           └── views/
│               ├── login.jsp
│               ├── request_form.jsp
│               ├── request_list.jsp
│               └── hospital_main.jsp
└── pom.xml
```

---

## 10. 확장 가능성 (추후 개발)

현재 버전 완성 후, 아래 기능 추가 고려:

| 우선순위 | 기능 | 예상 시간 |
|----------|------|----------|
| 1 | 실시간 알림 (WebSocket) | +4h |
| 2 | 병원별 수용 통계 | +2h |
| 3 | 환자 위치 지도 표시 | +3h |
| 4 | 모바일 반응형 UI | +2h |

---

**작성일**: 2026-01-01
**버전**: 1.0
**목표 개발 시간**: 15시간
