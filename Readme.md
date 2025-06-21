
# Como gerar as imagens Docker para Front-Departamentalizacao

Este projeto utiliza a versão **Node 20.11.1**

---

## 1. Imagem leve (~80MB) — Build com Node e runtime com NGINX (multistage)

**Descrição:**  
Nesta abordagem, usamos uma etapa de build com Node para gerar a pasta estática `out/` via `next export`, e depois copiamos essa pasta para uma imagem NGINX leve que serve o site estático.

---

### Passos para construir e enviar a imagem

```bash
# Build da imagem (Dockerfile em nginx/Dockerfile)
docker build --build-arg NEXT_PUBLIC_API_URL=http://192.168.237.85:8000 -t dionidias/front-departamentalizacao:latest .
docker build --build-arg NEXT_PUBLIC_API_URL=http://192.168.237.85:8000 -t dionidias/front-departamentalizacao:1.0 .

# Enviar para o Docker Hub
docker push dionidias/front-departamentalizacao:latest
```
docker build -t dionidias/front-departamentalizacao:1.0 .
docker push dionidias/front-departamentalizacao:1.0
---
docker build --build-arg NEXT_PUBLIC_API_URL=http://192.168.237.85:8000 -t dionidias/front-departamentalizacao:1.0 .
docker push dionidias/front-departamentalizacao:1.0


### Benefícios

- Imagem final **muito leve** (~80MB)
- Runtime super enxuto com NGINX
- Ideal para produção com melhor performance e menor consumo

---

