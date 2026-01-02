import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class DataSourceTest {
    @Test
    public void testConnection(){
        ApplicationContext c = new FileSystemXmlApplicationContext("src/main/webapp/WEB-INF/applicationContext.xml");
        DataSource ds =(DataSource) c.getBean("dataSource");
        try {
            Connection con = ds.getConnection();
            System.out.println("DB 연결 성공!");
        } catch (SQLException e) {
            System.out.println("DB 연결 실패");
            throw new RuntimeException(e);
        }
    }
}