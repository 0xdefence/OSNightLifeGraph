cmake_minimum_required(VERSION 3.20)
project(darkknight_optimizer LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(pybind11 REQUIRED)

pybind11_add_module(_optimizer src/optimizer.cpp)

install(TARGETS _optimizer DESTINATION darkknight_optimizer)
