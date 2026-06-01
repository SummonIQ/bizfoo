export default {
  name: "bizfoo",
  description: "No AppLab configuration found",
  type: "monorepo",
  apps: [
    {
      description: "",
      dev: {
        command: "bun dev",
        port: 30240
      },
      name: "bizfoo",
      path: ".",
      type: "web-app"
    },
    {
      description: "",
      name: "client",
      path: "packages/client",
      type: "library"
    },
    {
      description: "",
      name: "server",
      path: "packages/server",
      type: "library"
    }
  ]
};
