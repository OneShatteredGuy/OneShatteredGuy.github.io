
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore-lite.js";

const firebaseConfig = {
    apiKey: "AIzaSyCfJxEQZ19bCXWzPk9xPciHCex1-04luxs",
    authDomain: "portfolio-website-4972e.firebaseapp.com",
    projectId: "portfolio-website-4972e",
    storageBucket: "portfolio-website-4972e.firebasestorage.app",
    messagingSenderId: "676835549264",
    appId: "1:676835549264:web:69773fbbd6bd78e5dd3155",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const load_info = {
    error_codes: {
        0: {
            error: "None",
            build_description() {return "No errors occurred during the running of this process";}
        }
    },
            
    processes: {
        async *firestoreFetch(current_static_info) {
            yield {
                ...current_static_info,
                progress: {
                    ...current_static_info.progress,
                    percent_complete: 0
                }
            };
        
            const attemptFetch = async (target) => {
                const snapshot = await getDoc(doc(db, "content", target));
                if (!snapshot.exists()) throw new Error(`Document '${target}' does not exist`);
                return snapshot;
            };
        
            let snapshot;
            let resolvedContent = current_static_info.desired_content;
        
            try {
                snapshot = await attemptFetch(resolvedContent);
            } catch (e) {
                console.error(`firestoreFetch failed for '${resolvedContent}', falling back to portfolio`, { e });
                if (resolvedContent !== 'portfolio') {
                    resolvedContent = 'portfolio';
                    try {
                        snapshot = await attemptFetch(resolvedContent);
                    } catch (e2) {
                        console.error(`firestoreFetch portfolio fallback also failed, fatal`, { e2 });
                        return;
                    }
                } else {
                    console.error(`firestoreFetch portfolio fetch failed, fatal`, { e });
                    return;
                }
            }
        
            yield {
                ...current_static_info,
                progress: {
                    processes_complete: [...current_static_info.progress.processes_complete, 'firestoreFetch'],
                    processes_to_go: current_static_info.progress.processes_to_go.filter(p => p !== 'firestoreFetch'),
                    percent_complete: 1.0
                },
                desired_content: resolvedContent,
                elements: snapshot.data().elements
            };
        }
    }
    
}

export async function* loadContent(desired_content = 'portfolio') {
    let current_static_info = {
        progress: {
            processes_complete: [],
            processes_to_go: Object.keys(load_info.processes),
            percent_complete: 0
        },
        desired_content
    }

    for (const [name, process] of Object.entries(load_info.processes)) {
        if (typeof process === 'function') {
            let updateID = 0;
            for await (const update of process(current_static_info)) {

                console.assert(Object.hasOwn(update, 'progress'),
                    `update malformed by ${name} at update ${updateID}`, { name, update, updateID });

                if (Object.hasOwn(update, 'progress')) {

                    console.assert(Object.hasOwn(update.progress, 'processes_complete'),
                        `processes_complete missing after ${name} update ${updateID}`, { progress: update.progress, name, updateID });
                    console.assert(Array.isArray(update.progress.processes_complete),
                        `processes_complete not array after ${name} update ${updateID}`, { processes_complete: update.progress.processes_complete, name, updateID });

                    console.assert(Object.hasOwn(update.progress, 'processes_to_go'),
                        `processes_to_go missing after ${name} update ${updateID}`, { progress: update.progress, name, updateID });
                    console.assert(Array.isArray(update.progress.processes_to_go),
                        `processes_to_go not array after ${name} update ${updateID}`, { processes_to_go: update.progress.processes_to_go, name, updateID });

                    console.assert(Object.hasOwn(update.progress, 'percent_complete'),
                        `percent_complete missing after ${name} update ${updateID}`, { progress: update.progress, name, updateID });
                    console.assert(Number.isFinite(update.progress.percent_complete),
                        `percent_complete not a number after ${name} update ${updateID}`, { percent_complete: update.progress.percent_complete, name, updateID });

                    if (Array.isArray(update.progress.processes_complete) &&
                        Array.isArray(update.progress.processes_to_go) &&
                        Number.isFinite(update.progress.percent_complete)) {

                        current_static_info = update;
                        updateID++;
                        yield update;

                    } else {
                        console.warn(`${name} yielded malformed update ${updateID}, skipping`, { update });
                        updateID++;
                    }

                } else {
                    console.warn(`${name} yielded update ${updateID} with no progress field, skipping`, { update });
                    updateID++;
                }
            }
        }
    }

    yield current_static_info;
    return;
}