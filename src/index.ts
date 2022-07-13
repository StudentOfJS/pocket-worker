export function pocketFn(jobProcessor: Function, ...props: any[]) {
    let blob = new Blob([(() => {
        onmessage = ({ data: { jobProcessor, props } }) => {
            postMessage(new Function(`return ${decodeURI(jobProcessor)}`)()(props))
        };
    }).toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '')], { type: 'text/javascript' });
    let objUrl = (window.URL || window.webkitURL).createObjectURL(blob)
    return new Promise((resolve, reject) => {
        let worker = new Worker(objUrl);
        worker.onmessage = ({ data, isTrusted }) => {
            isTrusted ? resolve(data) : reject("not authorised")
            worker.terminate();
            (window.URL || window.webkitURL).revokeObjectURL(objUrl)
        };
        worker.onerror = worker.onmessageerror = reject;
        worker.postMessage({ jobProcessor: encodeURI(jobProcessor.toString()), props });
        return worker;
    });
}