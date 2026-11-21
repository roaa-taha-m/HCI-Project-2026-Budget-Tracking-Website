import { Injectable, Injector, inject, runInInjectionContext } from "@angular/core";
import { Firestore, collection, collectionData, addDoc, deleteDoc, updateDoc, doc } from "@angular/fire/firestore";
import { Auth, authState } from "@angular/fire/auth"
import { Observable, filter, map, switchMap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class FirestoreService {
    private db = inject(Firestore);
    private auth = inject(Auth);
    private injector = inject(Injector);

    private uid$ = authState(this.auth).pipe(
        filter(user => !!user),
        map(user => user!.uid)
    );

    private get uid(): string {
        const uid = this.auth.currentUser?.uid;
        if (!uid) throw new Error('User is not logged in');
        return uid;
    }

    getAll<T>(name: string): Observable<T[]> {
        return this.uid$.pipe(
            switchMap(uid =>
                runInInjectionContext(this.injector, () =>
                collectionData(collection(this.db, `users/${uid}/${name}`), {idField: 'id'})
                ) as Observable<T[]>
            )
        );
    }

    add<T extends object>(name: string, data: T) {
        return addDoc(collection(this.db, `users/${this.uid}/${name}`), data);
    }

    update<T extends object>(name: string, id: string, data: Record<string, any>) {
        return updateDoc(doc(this.db, `users/${this.uid}/${name}/${id}`), data);
    }

    remove(name: string, id: string) {
        return deleteDoc(doc(this.db, `users/${this.uid}/${name}/${id}`));
    }
}