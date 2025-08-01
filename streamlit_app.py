import streamlit as st
from run import pipeline

st.title('AI Hawk Job Application System')

if st.button('Run Pipeline'):
    pipeline()
    st.success('Pipeline executed')
