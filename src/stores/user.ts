import { defineStore } from 'pinia'
import {request} from "@/util/request";

export const useUserInfoStore = defineStore('user', {
    state: ()=> {
        return {
            id: '',
            name: 'roco'
        }
    },
    actions: {

    },
    persist: true
})
