pragma solidity ^0.8.16;

contract Visitor {

  address[16] public visitors;  // 参观者地址

    // 签到
  function signin(uint boothID) public returns (uint) {
    require(boothID >= 0 && boothID <= 15);  // 确保id在数组长度内

    visitors[boothID] = msg.sender;        // 保存调用这地址
    return boothID;
  }

  // 返回参观者
  function getVisitors() public view returns (address[16] memory) {
    return visitors;
  }

}