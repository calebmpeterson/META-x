import { ChildProcessWithoutNullStreams, spawn } from "child_process";

type ToolResult = {
  stdout?: string;
  stderr?: string;
};

export class SpawnCache {
  private child: ChildProcessWithoutNullStreams | null = null;
  private ready: Promise<void> = Promise.resolve();

  constructor(
    private command: string,
    private args: string[] = []
  ) {
    this.spawnTool();
  }

  private spawnTool = () => {
    this.child = spawn(this.command, this.args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.child.stdout.setEncoding("utf-8");
    this.child.stderr.setEncoding("utf-8");

    this.child.on("exit", (code, signal) => {
      console.warn(
        `[tool] exited (code=${code}, signal=${signal}), respawning...`
      );
      this.child = null;
      this.spawnTool();
    });

    this.ready = new Promise((resolve) => {
      // Tool considered ready after minimal event loop tick
      process.nextTick(resolve);
    });
  };

  public async run(input: string): Promise<ToolResult> {
    await this.ready;
    const child = this.child;
    if (!child) return { stderr: "Tool is not available" };

    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";

      const onStdout = (chunk: Buffer | string) => {
        stdout += chunk.toString();
      };

      const onStderr = (chunk: Buffer | string) => {
        stderr += chunk.toString();
      };

      const onClose = () => {
        child.stdout.off("data", onStdout);
        child.stderr.off("data", onStderr);

        resolve({
          stdout: stdout || undefined,
          stderr: stderr || undefined,
        });
      };

      child.stdout.once("data", onStdout);
      child.stderr.once("data", onStderr);
      child.once("close", onClose);

      child.stdin.write(input);
      child.stdin.end();
    });
  }
}
