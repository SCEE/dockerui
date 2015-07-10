FROM scratch

COPY dockerui /
COPY dist /app/dist

EXPOSE 9000
ENTRYPOINT ["/dockerui"]
