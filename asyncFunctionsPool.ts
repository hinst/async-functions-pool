type AsyncFunc<T> = () => Promise<T>;

export class AsyncFunctionsPool<T> {
    private jobs: AsyncFunc<T>[];
    readonly results: T[];

    constructor(jobs: AsyncFunc<T>[]) {
        this.jobs = jobs.map((job, index) => async() => {
            const result = await job();
            this.results[index] = result;
            await this.runNextJob();
            return result;
        });
        this.results = jobs.map(job => null) as any[];
    }

    private async runNextJob() {
        const f = this.jobs.shift();
        if (f != null)
            await f();
    }

    async run(poolSize: number) {
        const remainingJobs = this.jobs.slice();
        const promises: Promise<void>[] = [];
        for (let i = 0; i < Math.min(poolSize, remainingJobs.length); i++)
            promises.push(this.runNextJob());
        await Promise.all(promises);
    }
}