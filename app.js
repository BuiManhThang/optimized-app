const app = Vue.createApp({
    data() {
        return {
            objectiveFunction: {
                giatri: [0],
                tienden: 'max'
            },
            constaints: []
        }
    },
    methods: {
        objectiveFunctionSubmitHandler(object) {
            this.objectiveFunction.giatri = [...object.variables];
            this.objectiveFunction.tienden = object.objective;
        },
        constaintSubmitHandle(constaint) {
            const constaintInThere = {};
            constaintInThere.giatri = [...constaint.giatri];
            constaintInThere.dau = constaint.dau;
            constaintInThere.kq = constaint.kq;
            this.constaints.push(constaintInThere);
        },
    },
    computed: {
        constaintsFormatted() {
            const arr = this.constaints.map((ele, index) => {
                let string = '';
                ele.giatri.forEach((ele2, index2) => {
                    string += `(${ele2})x${index2+1} ${index2 < ele.giatri.length - 1 ? '+': ''}`;
                });
                string += ele.dau + ' ';
                string += ele.kq;
                return string;
            });
            return arr;
        },
    },
})

app.component('result', {
    props: {
        hamMucTieu: Object,
        cacRangBuoc: Array
    },
    data() {
        return {
            objectiveFunc: {},
            constaints: [],
            result: [],
            f: null,
            voNghiem: false
        }
    },
    methods: {
        calculate() {
            this.objectiveFunc.giatri = [...this.hamMucTieu.giatri];
            this.objectiveFunc.tienden = this.hamMucTieu.tienden;
            this.cacRangBuoc.forEach(ele => {
                const ele2 = {};
                ele2.giatri = [...ele.giatri];
                ele2.dau = ele.dau;
                ele2.kq = ele.kq;
                this.constaints.push(ele2);
            })
            const hamMucTieu = this.objectiveFunc;

            let soBienHamMucTieu = hamMucTieu.giatri.length;

            const constraints = this.constaints;

            // n???u v??? ph???i r??ng bu???c ??m th?? ?????i d???u 
            constraints.forEach(ele => {
                if(ele.kq < 0) {
                    ele.giatri = ele.giatri.map(ele2 => {
                        return ele2 * -1;
                    });
                    ele.kq *= -1;
                    if(ele.dau === '>=') {
                        ele.dau = '<=';
                    } else if(ele.dau === '<=') {
                        ele.dau = '>=';
                    } else {
                        ele.dau = '==';
                    }
                }
            })

            // n???u h??m m???c ti??u ti???n ????n min th?? ?????i d???u h??m m???c ti??u 
            if(hamMucTieu.tienden === 'min') {
                hamMucTieu.giatri = hamMucTieu.giatri.map(ele => {
                    return ele * -1;
                })
            }

            let coSo = []; // khai b??o c?? s???
            let constraintsCoCoSo = [];

            // t??m c??c c???t t???o th??nh ma tr???n ????n v??? 
            constraints.forEach((ele, index) => {
                ele.giatri.forEach((value, index2) => {
                    if(value === 1) {
                        let dem2 = 0;
                        constraints.forEach((eleNho) => {
                            if(eleNho.giatri[index2] === 0) {
                                dem2 += 1;
                            }
                        });
                        if(dem2 === constraints.length - 1) {
                            coSo[index] = (index2 + 1);
                            constraintsCoCoSo.push(index);
                        }
                    }
                })
            });

            let dem = 0;
            // n???u ch??a t???o ???????c ma tr???n ????n v??? th?? th??m bi???n ph??? v?? bi???n gi??? t???o t????ng ???ng 
            if(coSo.length < constraints.length) {
                constraints.forEach((ele, index) => {
                    if(constraintsCoCoSo.indexOf(index) === -1) {
                        if(ele.dau === '<=') {
                            for(let i = 1; i <= dem; i++) {
                                ele.giatri.push(0);
                            }
                            ele.giatri.push(1);
                            coSo[index] = (ele.giatri.length);
                            hamMucTieu.giatri.push(0);
                            dem+=1;
                        } else if(ele.dau === '==') {
                            for(let i = 1; i <= dem; i++) {
                                ele.giatri.push(0);
                            }
                            ele.giatri.push(1);
                            coSo[index] = (ele.giatri.length);
                            hamMucTieu.giatri.push('-M');
                            dem+=1;
                        }
                        else {
                            for(let i = 1; i <= dem; i++) {
                                ele.giatri.push(0);
                            }
                            ele.giatri.push(-1);
                            hamMucTieu.giatri.push(0);
                            ele.giatri.push(1);
                            coSo[index] = (ele.giatri.length);
                            hamMucTieu.giatri.push('-M');
                            coSo.push(index);
                            dem+=2;
                        }
                    }

                });
            }

            let soBien = constraints[constraints.length - 1].giatri.length;
            constraints.forEach(ele => {
                for(let i = ele.giatri.length; i < soBien; i++) {
                    ele.giatri.push(0);
                }
            })

            // kh???i t???i delta, theta v?? n 
            let delta;
            let theta;
            let n;
            let J = constraints[0].giatri.length;

            // h??m ki???m tra xem to??n b??? delta c?? >= 0 hay ko
            const ktDelta = () => {
                return delta.every(ele => {
                    return ele >= 0;
                })
            }
            //h??m ki???m tra xem to??n b??? n c?? >= 0 hay kh??ng
            const ktn = () => {
                return n.every(ele => {
                    return ele >= 0;
                })
            }
            // ti???n h??nh l???p b???ng ?????u ti??n 
            let voNghiem = false;
            do {
                delta = [];
                theta = [];
                n = [];
                for(let i = 0; i < J; i++) {
                    theta[i] = 0;
                    n[i] = 0;
                    constraints.forEach((ele1, index1) => {
                        if(hamMucTieu.giatri[coSo[index1] - 1] === '-M') {
                            n[i] += ele1.giatri[i] * -1;
                        } else {
                            theta[i] += ele1.giatri[i] * hamMucTieu.giatri[coSo[index1] - 1];
                        }
                    })
                    n[i] -= (hamMucTieu.giatri[i] === '-M' ? -1 : 0);
                    theta[i] -= (hamMucTieu.giatri[i] === '-M' ? 0 : hamMucTieu.giatri[i]);
                    delta.push(theta[i]);
                }

                // n???u detal ho???c n ch??a d????ng h???t th?? t??m d??ng xoay, c???t xoay 
                if(!ktDelta() || !ktn()) {
                    let deltaMin;
                    let indexMin; // indexMin ch???a v??? tr?? c???a c???t xoay 
                    if(!ktn()) { // n???u n c?? 1 ph???n t??? c?? gi?? tr??? < 0 th?? t??m c???t xoay theo n 
                        deltaMin = Math.min(...n);
                        indexMin = n.indexOf(deltaMin);
                        for(let cc = 0; cc < n.length; cc++) {
                            if(n[cc] === deltaMin) {
                                if(theta[cc] < theta[indexMin]) {
                                    indexMin = cc;
                                }
                            }
                        }
                    } else { // n???u delta c?? 1 ph???n t??? c?? gi?? tr??? < 0 th?? t??m c???t xoay theo delta 
                        for(let t = 0; t < n.length; t++) {
                            if(n[t] > 0) {
                                delta[t] = 0;
                            }
                        }
                        deltaMin = Math.min(...delta);
                        indexMin = delta.indexOf(deltaMin);
                    }
                    voNghiem = constraints.every(ele => { // ki???m tra n???u t???t c??? ph???n t??? c???a c???t xoay ?????u < 0 th?? voNgiem = true 
                        return ele.giatri[indexMin] < 0;
                    })
                    if(voNghiem) { // n???u voNghiem = true th?? k???t th??c
                        break;
                    } else { // ng?????c l???i n???u kh??ng v?? nghi???m th?? t??m d??ng xoay 
                        const arrayCot = []; // m???ng ch???a gi?? tr??? c???a ph????ng ??n / gi?? tr??? l???n h??n 0 
                        const gtCoSo = [] // m???ng l??u v??? tr?? 
                        constraints.forEach((ele, index) => {
                            if(ele.giatri[indexMin] > 0) {
                                arrayCot.push(ele.kq / ele.giatri[indexMin]);
                                gtCoSo.push(coSo[index]);
                            }
                        })
                        let minCuaCot = Math.min(...arrayCot);
                        let dongXoay = coSo.indexOf(gtCoSo[arrayCot.indexOf(minCuaCot)]);

                        coSo[coSo.indexOf(coSo[dongXoay])] =  indexMin + 1; // c?? s??? m???i 


                        let truc = constraints[dongXoay].giatri[indexMin]; // ph???n t??? tr???c 
                        
                        // t??nh b???ng ti???p theo 
                        constraints[dongXoay].giatri.forEach((ele2, index2) => { // t??nh d??ng ch??nh c???a b???ng ti???p theo 
                            constraints[dongXoay].giatri[index2] = ele2 / truc;
                        })
                        constraints[dongXoay].kq = constraints[dongXoay].kq / truc; // ph????ng ??n c???a d??ng ch??nh 

                        constraints.forEach((ele, index) => { // t??nh c??c d??ng kh??c d??ng ch??nh 
                            let trucCuaHang = ele.giatri[indexMin];
                            if(index !== dongXoay) {
                                ele.giatri.forEach((ele2, index2) => {
                                    ele.giatri[index2] = ele2 - trucCuaHang * constraints[dongXoay].giatri[index2];
                                })
                                ele.kq = ele.kq - trucCuaHang * constraints[dongXoay].kq; // t??nh ph????ng ??n thu???c c??c d??ng kh??c d??ng ch??nh 
                            }
                        });
                    }
                }
            } while(!ktDelta() || !ktn());

            let result = [];
            for(let i = 0; i < soBienHamMucTieu; i++) {
                result[i] = 0;
            }
            constraints.forEach((ele, index) => {
                if(coSo[index] -1 < soBienHamMucTieu) {
                    result[coSo[index] - 1] = ele.kq;
                }
            });
            let tong = 0;
            result.forEach((ele, index) => {
                tong += ele * hamMucTieu.giatri[index];
            })
            if(hamMucTieu.tienden === 'min') {
                tong *= -1;
            }
            this.result = result;
            this.f = tong;
            this.voNghiem = voNghiem;
        }
    },
    template: `
        <button class="btn btn-warning mt-3" @click="calculate">T??nh</button>
        <div v-if="voNghiem">
            <p>V?? nghi???m</p>
        </div>
        <div v-else>
            <p :style="{color: 'red'}" > x* = {{result}} </p>
            <p :style="{color: 'red'}" > f(x*) = {{f}} </p>
        </div>
    `
})

app.component('constaints', {
    props: {
        constaints: Array
    },
    template: `
        <div class="constaints" >
            <p v-if="constaints.length > 0"> C??c r??ng bu???c </p>
            <p v-for="constaint, index in constaints" :key="'constaint'+index" > {{index+1}}: {{constaint}} </p>
        </div>
    `,
    

})

app.component('form-constaint', {
    props: {
        variables: Array
    },
    data() {
        return {
            giatri: [],
            dau: '<=',
            kq: null
        }
    },
    template: `
        <div class="form-constaint">
            <p> R??ng bu???c (M???c ?????nh cho c??c bi???n >= 0) </p>
            <form @submit.prevent="onSubmit2" class="form-objective-function__form" autocomplete="off">
                <div v-for="variable, index in variables" :key="'ahaha'+index" class="form-group">
                    <input :id="'ahaha'+index" class="form-control" v-model.number="giatri[index]" type="text" />
                    <label :for="'ahaha'+index" class="form-label"> x{{index+1}} 
                        <template v-if="index < variables.length - 1" > + </template>
                    </label>
                </div>
                <select class="form-control mini" v-model="dau">
                    <option value="<=" > &lt= </option>
                    <option value="==" > == </option>
                    <option value=">=" > >= </option>
                </select>
                <input class="form-control ms-3" v-model.number="kq" type="text" />
                <button type="submit" class="btn btn-primary ms-3"> X??c nh???n </button>
            </form>
        </div>
    `,
    methods: {
        onSubmit2() {
            const aa = {};
            aa.giatri = this.giatri;
            aa.dau = this.dau;
            aa.kq = this.kq;
            this.$emit('constaint-submit', aa);
            this.giatri = [];
            this.dau = '<=';
            this.kq = null;
        }
    }
})

app.component('objective-function', {
    props: {
        objectivefunction: Object
    },
    template: `
        <p> H??m m???c ti??u: </p>
        <p> {{objectiveFunctionText}}  </p>
    `,
    computed: {
        objectiveFunctionText() {
            let string = 'f(x) = ';
            this.objectivefunction.giatri.forEach((ele, index) => {
                string += `(${ele})x${index+1}${index < this.objectivefunction.giatri.length -1 ? ' + ' : '--> '}`;
            });
            string += this.objectivefunction.tienden;
            return string;
        }
    }
})

app.component('form-objective-function', {
    data() {
        return {
            objectiveFunction: {
                variables: [0],
                objective: 'max'
            }

        }
    },
    template: `
        <div class="form-objective-function" >
            <button class="btn btn-success" @click="objectiveFunction.variables.push(0)"> Th??m bi???n </button>
            <p> H??m m???c ti??u </p>
            <form @submit.prevent="onSubmit" class="form-objective-function__form" autocomplete="off" >
                <div class="variables-layout" :style="{width: objectiveFunction.variables.length * 140 + 'px'}">
                    <div v-for="variable, index in objectiveFunction.variables" :key="'variable-obj'+index" class="form-group">
                        <input :id="'variable-obj'+index" class="form-control" v-model.number="objectiveFunction.variables[index]" type="text" />
                        <label :for="'variable-obj'+index" class="form-label"> x{{index+1}} 
                            <template v-if="index < objectiveFunction.variables.length - 1" > + </template>
                        </label>
                    </div>
                </div>
                <p> ==> </p>
                <select class="form-control mini ms-3" v-model="objectiveFunction.objective">
                    <option value="max" > max </option>
                    <option value="min" > min </option>
                </select>
                <button type="submit" class="btn btn-primary ms-3"> X??c nh???n </button>
            </form>
        </div>
    `,
    methods: {
        onSubmit() {
            this.$emit('objective-function-submit', this.objectiveFunction);
        }
    }
})




app.mount('#app');