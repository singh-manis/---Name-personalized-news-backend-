"use strict";(self.webpackChunkpersonalized_news_frontend=self.webpackChunkpersonalized_news_frontend||[]).push([[919],{1919:(e,r,s)=>{s.r(r),s.d(r,{default:()=>c});var a=s(9379),o=s(9950),n=s(8429),t=s(2074),l=s(6910),d=s(9348),i=(s(2171),s(4414));function c(){const e=(0,n.Zp)(),[r,s]=(0,o.useState)({email:"",password:""}),{email:c,password:m}=r,p=e=>{s((0,a.A)((0,a.A)({},r),{},{[e.target.name]:e.target.value}))};return(0,i.jsx)("div",{className:"modern-bg min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8",children:(0,i.jsx)("div",{className:"max-w-md w-full space-y-8",children:(0,i.jsxs)("div",{className:"bg-white rounded-2xl shadow-2xl p-10 border border-gray-100",children:[(0,i.jsx)("h2",{className:"text-center text-3xl font-extrabold text-primary-700 mb-4 tracking-tight drop-shadow",children:"Sign in to your account"}),(0,i.jsxs)("p",{className:"text-center text-sm text-gray-600 mb-6",children:["Or"," ",(0,i.jsx)(t.N_,{to:"/register",className:"font-medium text-primary-600 hover:text-primary-500",children:"create a new account"})]}),(0,i.jsxs)("form",{className:"space-y-6",onSubmit:async s=>{s.preventDefault();try{const s=await l.A.post("".concat("http://localhost:5000","/api/auth/login"),r);localStorage.setItem("token",s.data.token),d.oR.success("Login successful!"),e("/")}catch(n){var a,o;d.oR.error((null===(a=n.response)||void 0===a||null===(o=a.data)||void 0===o?void 0:o.msg)||"An error occurred")}},children:[(0,i.jsxs)("div",{className:"rounded-md shadow-sm -space-y-px",children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("label",{htmlFor:"email",className:"sr-only",children:"Email address"}),(0,i.jsx)("input",{id:"email",name:"email",type:"email",required:!0,className:"appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm",placeholder:"Email address",value:c,onChange:p})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("label",{htmlFor:"password",className:"sr-only",children:"Password"}),(0,i.jsx)("input",{id:"password",name:"password",type:"password",required:!0,className:"appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm",placeholder:"Password",value:m,onChange:p})]})]}),(0,i.jsx)("div",{children:(0,i.jsx)("button",{type:"submit",className:"group relative w-full flex justify-center py-2 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow",children:"Sign in"})})]})]})})})}},2171:()=>{}}]);