FROM jupyter/base-notebook

USER $NB_UID
RUN conda install --quiet --yes \
      statsmodels \
      numpy \
      scipy \
      ipykernel \
      matplotlib \
      seaborn \
      pydot \
      graphviz \
      && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER
