# tag: pom

total: 1

## #11332
- added: 2016-07-21 05:03:02

<build>\n    <finalName>sales-automation</finalName>\n    <plugins>\n\n      <!— download source code in Eclipse, best practice —>\n      <plugin>\n        <groupId>org.apache.maven.plugins</groupId>\n        <artifactId>maven-eclipse-plugin</artifactId>\n        <version>2.9</version>\n        <configuration>\n          <downloadSources>true</downloadSources>\n          <downloadJavadocs>false</downloadJavadocs>\n        </configuration>\n      </plugin>\n\n      <!— Set a compiler level —>\n      <plugin>\n        <groupId>org.apache.maven.plugins</groupId>\n        <artifactId>maven-compiler-plugin</artifactId>\n        <version>2.3.2</version>\n        <configuration>\n          <source>${jdk.version}</source>\n          <target>${jdk.version}</target>\n        </configuration>\n      </plugin>\n\n      <!— Maven Assembly Plugin —>\n      <plugin>\n        <groupId>org.apache.maven.plugins</groupId>\n        <artifactId>maven-assembly-plugin</artifactId>\n        <version>2.4.1</version>\n        <configuration>\n          <!— get all project dependencies —>\n          <descriptorRefs>\n            <descriptorRef>jar-with-dependencies</descriptorRef>\n          </descriptorRefs>\n          <!— MainClass in mainfest make a executable jar —>\n          <archive>\n            <manifest>\n              <mainClass>org.lightadmin.boot.LightAdminBootApplication</mainClass>\n            </manifest>\n          </archive>\n\n        </configuration>\n        <executions>\n          <execution>\n            <id>make-assembly</id>\n            <!— bind to the packaging phase —>\n            <phase>package</phase>\n            <goals>\n              <goal>single</goal>\n            </goals>\n          </execution>\n        </executions>\n      </plugin>\n\n    </plugins>\n  </build>

---
