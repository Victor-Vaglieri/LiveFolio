# Usar imagem oficial do Maven com Eclipse Temurin (Java 21)
FROM maven:3.9.6-eclipse-temurin-21

WORKDIR /app

# Primeiro copia apenas o pom.xml e baixa as dependencias (caching)
COPY pom.xml .
RUN mvn dependency:go-offline

# Depois copia o codigo fonte
COPY src ./src

# Expoe a porta do Spring Boot
EXPOSE 8080

# Comando para rodar a aplicacao em modo de desenvolvimento
CMD ["mvn", "spring-boot:run"]
