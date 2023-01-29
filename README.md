#  Wallet Coding Challenge
   
## Developed by
[![Linkedin](https://i.stack.imgur.com/gVE0j.png) ARUN RAI](https://www.linkedin.com/in/arunnrai/)

## prerequisite    
- Docker

## Used Technologies and frameworks
- [Docker](https://www.docker.com/)
- [NodeJs 16](https://nodejs.org/en/)
- [MySql 5.7](https://dev.mysql.com/downloads/mysql/5.7.html)
- [SwaggerUI](https://swagger.io/tools/swagger-ui/) - to visualize and interact with the API’s resources using given OpenAPI Specification
- [Express](https://expressjs.com/) -web framework for Node.js
- [Jest](https://jestjs.io/) - JavaScript testing framework.
- [Supertest](https://www.npmjs.com/package/supertest) - A library for testing Node.js HTTP servers
- [currency.js](https://currency.js.org/) fix common floating point issues in javascript with a flexible api


## Local development via Docker

```
docker-compose up -d //use your terminal 
```

## Resources and links

### Apis  
```
http://localhost:3000/
```

### SwaggerUI for testing apis
```
http://localhost:3000/api-docs/
```

### PhpMyAdmin to access DB
```
http://localhost:8080/ //review .env for credentials
```

Unit Testing for continuous integration and quick testing (it takes approx 8 second to test all apis)
```
docker-compose up -d  
docker compose run app npm test
```

:heavy_check_mark: Test passed

![Screenshot from 2023-01-22 07-05-33](https://user-images.githubusercontent.com/123216291/213896766-17c590fa-a843-497c-88d2-d888d774f072.png)
