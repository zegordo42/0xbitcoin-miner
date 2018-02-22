{
  "targets": [
    {
      "target_name": "cpuminer",
      "sources": [
        "addon.cc",
        "cpuminer.cpp",
        "solver.cpp",
        "sha3.c"
      ],
      'cflags_cc+': [ '-march=native', '-O3', '-std=c++17' ],
      "include_dirs": ["<!(node -e \"require('nan')\")"]
    }
  ]
}
