#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function pbk_cmp () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  local ITEM= UNIQ=
  printf -v UNIQ '@%(%y%m%d-%H%M%S)T.%s' -1 "$$"

  local TODO=( "$@" )
  case "$#:$1" in
    1:--selfscan )
      cd -- "$SELFPATH" || return $?
      TODO=( */*.pbk-want.yaml )
      ;;
  esac
  for ITEM in "${TODO[@]}"; do
    [ -f "$ITEM" ] || [ -f "$ITEM.mjs" ] || return $?$(
      echo "E: no such file: $ITEM" >&2)
    ITEM="${ITEM%.mjs}"
    ITEM="${ITEM%.pbk-want.yaml}"
    pbk_cmp_one "$ITEM" || return $?
  done
}


function pbk_cmp_one () {
  local PLAN="$1"
  echo -n "$PLAN: "
  local BFN="$(basename -- "$PLAN")"
  local JSON="tmp.$BFN.$UNIQ.flatTodo.json"
  local PLBK="tmp.$BFN.$UNIQ.yaml"
  local DIFF="tmp.$BFN.diff"
  SECONDS=0
  ubborg-planner-pmb depsTree --format=flatTodoJson \
    -- "$PLAN" >"$JSON" || return $?
  ubborg-playbookie-pmb "$JSON" >"$PLBK" || return $?
  echo -n "$SECONDS sec, "
  wc --lines -- "$PLBK"

  local WANT="$PLAN.pbk-want.yaml"
  if [ -s "$WANT" ]; then
    if diff -sU 5 -- "$WANT" "$PLBK" >"$DIFF"; then
      echo "    == $WANT"
      rm -- "$JSON" "$PLBK" "$DIFF"
    else
      head --lines=20 -- "$DIFF" | colordiff
    fi
  fi
}


pbk_cmp "$@"; exit $?
