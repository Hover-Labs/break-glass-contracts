import smartpy as sp

#####################################################################################
#####################################################################################
# Contract
#####################################################################################
#####################################################################################

# A break glass contract that can revert control of a governor in Kolibri Minter.
class MinterBreakGlass(sp.Contract):
  def __init__(
    self,
    
    # The address that the break glass contract will accept arbitrary lambdas from.
    daoAddress = sp.address("KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9"),

    # The address of the contract that may break glass and revert control.
    multisigAddress = sp.address("KT1VcAVYGg2gvZ1NxnZwAzUaPf7i8iGjoAtv"),

    # The contract being managed by this break glass.
    targetAddress = sp.address("KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV"),
  ):
    self.init(
      daoAddress = daoAddress,
      multisigAddress = multisigAddress,
      targetAddress = targetAddress,
    )
      
  # Revert control the the admin. May only be called by the multisig.        
  @sp.entry_point
  def breakGlass(self, newContracts):
    sp.set_type(
      newContracts, 
      sp.TRecord(
        governorContract = sp.TAddress,
        tokenContract = sp.TAddress,
        ovenProxyContract = sp.TAddress,
        stabilityFundContract = sp.TAddress,
        developerFundContract = sp.TAddress,
      ).layout(("governorContract", ("tokenContract", ("ovenProxyContract", ("stabilityFundContract", "developerFundContract")))))
    )

    # Can only be called by the multisig.
    sp.verify(sp.sender == self.data.multisigAddress, "NOT_MSIG")
    targetParam = (newContracts.governorContract, (newContracts.tokenContract, (newContracts.ovenProxyContract, (newContracts.stabilityFundContract, newContracts.developerFundContract))))
    targetContractHandle = sp.contract(
      sp.TPair(sp.TAddress, sp.TPair(sp.TAddress, sp.TPair(sp.TAddress, sp.TPair(sp.TAddress, sp.TAddress)))),
      self.data.targetAddress, 
      'updateContracts'
    ).open_some()
    sp.transfer(targetParam, sp.mutez(0), targetContractHandle)

  # Run a lambda. May only be called by the DAO.
  @sp.entry_point
  def runLambda(self, lambdaToExecute):
    sp.set_type(lambdaToExecute, sp.TLambda(sp.TUnit, sp.TList(sp.TOperation)))

    # Can only be called by the DAO.
    sp.verify(sp.sender == self.data.daoAddress, "NOT_DAO")
    
    # Execute Request
    operations = lambdaToExecute(sp.unit)
    sp.set_type(operations, sp.TList(sp.TOperation))
    sp.add_operations(operations)

#####################################################################################
#####################################################################################
# Tests
#####################################################################################
#####################################################################################

#####################################################################################
# Helpers
#####################################################################################

# Helper class. Stores a value that is only updateable by the governor.
class Box(sp.Contract):
  def __init__(
    self,
    governorAddress = sp.address("tz1abmz7jiCV2GH2u81LRrGgAFFgvQgiDiaf"),
  ):
    self.init(
      governorAddress = governorAddress,
      value = sp.nat(0)
    )

  # Update the contracts
  @sp.entry_point
  def updateContracts(self, newParams):
    sp.set_type(
      newParams, 
      sp.TPair(sp.TAddress, sp.TPair(sp.TAddress, sp.TPair(sp.TAddress, sp.TPair(sp.TAddress, sp.TAddress))))
    )

    sp.verify(sp.sender == self.data.governorAddress, message = "NOT_GOVERNOR")

    newGovernorContractAddress = sp.fst(newParams)

    self.data.governorAddress = newGovernorContractAddress

  # Set a new value. May only be called by the governor.        
  @sp.entry_point
  def update(self, newValue):
    sp.set_type(newValue, sp.TNat)
    sp.verify(sp.sender == self.data.governorAddress, "NOT_GOVERNOR")
    self.data.value = newValue

#####################################################################################
# breakGlass
#####################################################################################

@sp.add_test(name = "breakGlass - can break glass")
def test():
  scenario = sp.test_scenario()
  
  # GIVEN multisig and DAO addresses  
  multisigAddress = sp.address("tz1hoverof3f2F8NAavUyTjbFBstZXTqnUMS")        
  daoAddress = sp.address("KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9")

  # AND a box contract
  box = Box(
    governorAddress = multisigAddress
  )
  scenario += box
      
  # AND a break glass contract targeting the box
  breakGlass = MinterBreakGlass(
    daoAddress = daoAddress,
    multisigAddress = multisigAddress,
    targetAddress = box.address,
  )
  scenario += breakGlass

  # AND the box is governed by the break glass
  meaninglessAddress = sp.address("tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk")
  newBoxContractsParam = (breakGlass.address, (meaninglessAddress, (meaninglessAddress, (meaninglessAddress, meaninglessAddress))))
  scenario += box.updateContracts(newBoxContractsParam).run(
    sender = multisigAddress
  )
  
  # WHEN glass is broken by the multisig
  newContractsParam = sp.record(
    governorContract = multisigAddress,
    tokenContract = meaninglessAddress,
    ovenProxyContract = meaninglessAddress,
    stabilityFundContract = meaninglessAddress,
    developerFundContract = meaninglessAddress,
  )
  scenario += breakGlass.breakGlass(newContractsParam).run(
    sender = multisigAddress
  )

  # THEN control is reverted to the multisig.
  scenario.verify(box.data.governorAddress == multisigAddress)

@sp.add_test(name = "breakGlass - break glass fails if not called by multisig")
def test():
  scenario = sp.test_scenario()
  
  # GIVEN multisig and DAO addresses  
  multisigAddress = sp.address("tz1hoverof3f2F8NAavUyTjbFBstZXTqnUMS")        
  daoAddress = sp.address("KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9")

  # AND a box contract
  box = Box(
    governorAddress = multisigAddress
  )
  scenario += box
      
  # AND a break glass contract targeting the box
  breakGlass = MinterBreakGlass(
    daoAddress = daoAddress,
    multisigAddress = multisigAddress,
    targetAddress = box.address,
  )
  scenario += breakGlass

  # AND the box is governed by the break glass
  meaninglessAddress = sp.address("tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk")
  newBoxContractsParam = (breakGlass.address, (meaninglessAddress, (meaninglessAddress, (meaninglessAddress, meaninglessAddress))))
  scenario += box.updateContracts(newBoxContractsParam).run(
    sender = multisigAddress
  )
  
  # WHEN glass is attempted to be broken by someone other than the multisig.
  # THEN the call fails.
  newContractsParam = sp.record(
    governorContract = multisigAddress,
    tokenContract = meaninglessAddress,
    ovenProxyContract = meaninglessAddress,
    stabilityFundContract = meaninglessAddress,
    developerFundContract = meaninglessAddress,
  )
  scenario += breakGlass.breakGlass(newContractsParam).run(
    sender = daoAddress,
    valid = False,
  )

#####################################################################################
# runLambda
#####################################################################################

@sp.add_test(name = "runLambda - can update store")
def test():
  scenario = sp.test_scenario()
  
  # GIVEN multisig and DAO addresses  
  multisigAddress = sp.address("tz1hoverof3f2F8NAavUyTjbFBstZXTqnUMS")        
  daoAddress = sp.address("KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9")

  # AND a box contract
  box = Box(
    governorAddress = multisigAddress
  )
  scenario += box
      
  # AND a break glass contract targeting the box
  breakGlass = MinterBreakGlass(
    daoAddress = daoAddress,
    multisigAddress = multisigAddress,
    targetAddress = box.address,
  )
  scenario += breakGlass

  # AND the box is governed by the break glass
  meaninglessAddress = sp.address("tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk")
  newBoxContractsParam = (breakGlass.address, (meaninglessAddress, (meaninglessAddress, (meaninglessAddress, meaninglessAddress))))
  scenario += box.updateContracts(newBoxContractsParam).run(
    sender = multisigAddress
  )

  # AND a lambda to update the box's value
  newValue = sp.nat(3)
  def updateLambda(unitParam):
    sp.set_type(unitParam, sp.TUnit)
    storeContractHandle = sp.contract(sp.TNat, box.address, 'update').open_some()
    sp.result([sp.transfer_operation(newValue, sp.mutez(0), storeContractHandle)])

  # WHEN the lambda is run by the DAO
  scenario += breakGlass.runLambda(updateLambda).run(
    sender = daoAddress
  )

  # THEN the box's value is update
  scenario.verify(box.data.value == newValue)

@sp.add_test(name = "runLambda - fails if not called by DAO")
def test():
  scenario = sp.test_scenario()
  
  # GIVEN multisig and DAO addresses  
  multisigAddress = sp.address("tz1hoverof3f2F8NAavUyTjbFBstZXTqnUMS")        
  daoAddress = sp.address("KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9")

  # AND a box contract
  box = Box(
    governorAddress = multisigAddress
  )
  scenario += box
      
  # AND a break glass contract targeting the box
  breakGlass = MinterBreakGlass(
    daoAddress = daoAddress,
    multisigAddress = multisigAddress,
    targetAddress = box.address,
  )
  scenario += breakGlass

  # AND the box is governed by the break glass
  meaninglessAddress = sp.address("tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk")
  newBoxContractsParam = (breakGlass.address, (meaninglessAddress, (meaninglessAddress, (meaninglessAddress, meaninglessAddress))))
  scenario += box.updateContracts(newBoxContractsParam).run(
    sender = multisigAddress
  )
  
  # AND a lambda to update the box's value
  newValue = sp.nat(3)
  def updateLambda(unitParam):
    sp.set_type(unitParam, sp.TUnit)
    storeContractHandle = sp.contract(sp.TNat, box.address, 'update').open_some()
    sp.result([sp.transfer_operation(newValue, sp.mutez(0), storeContractHandle)])

  # WHEN the lambda is run by someone other than the DAO
  # THEN the call fails
  scenario += breakGlass.runLambda(updateLambda).run(
    sender = multisigAddress,
    valid = False,
  )

#####################################################################################
# End to End
#####################################################################################

# Real world test showing how deployment would would.
@sp.add_test(name = "end to end tests")
def test():
  scenario = sp.test_scenario()
  
  # The multisig address.    
  multisigAddress = sp.address("tz1hoverof3f2F8NAavUyTjbFBstZXTqnUMS")        
      
  # And there's a DAO
  daoAddress = sp.address("KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9")

  # A box contract is controlled by the MSig. Just like Kolibri contracts today.
  box = Box(
    governorAddress = multisigAddress
  )
  scenario += box
      
  # A break glass gets deployed which maps the dao and break glass to the store.
  breakGlass = MinterBreakGlass(
    daoAddress = daoAddress,
    multisigAddress = multisigAddress,
    targetAddress = box.address,
  )
  scenario += breakGlass

  # The multisig gives up control to the break glass.
  meaninglessAddress = sp.address("tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk")
  newBoxContractsParam = (breakGlass.address, (meaninglessAddress, (meaninglessAddress, (meaninglessAddress, meaninglessAddress))))
  scenario += box.updateContracts(newBoxContractsParam).run(
    sender = multisigAddress
  )
  
  # THEN permissions are set correctly
  scenario.verify(box.data.governorAddress == breakGlass.address)
  scenario.verify(breakGlass.data.targetAddress == box.address)
  scenario.verify(breakGlass.data.multisigAddress == multisigAddress)
  scenario.verify(breakGlass.data.daoAddress == daoAddress)
  
  # A lambda is crafted to update the store address.
  newValue = sp.nat(3)
  def updateLambda(unitParam):
    sp.set_type(unitParam, sp.TUnit)
    storeContractHandle = sp.contract(sp.TNat, box.address, 'update').open_some()
    sp.result([sp.transfer_operation(newValue, sp.mutez(0), storeContractHandle)])
  
  # AND the lambda is executed in the break glass by the dao.
  scenario += breakGlass.runLambda(updateLambda).run(
    sender = daoAddress
  )
  
  # Then things go as planned and the value in the box is updated
  scenario.verify(box.data.value == newValue)
  
  # Of course, if we try to update the box directly, that fails.
  scenario += box.update(sp.nat(4)).run(
    sender = multisigAddress,
    valid = False,
  )
  
  # Oh no, the DAO is unstable. Let's break glass to get back control
  newContractsParam = sp.record(
    governorContract = multisigAddress,
    tokenContract = meaninglessAddress,
    ovenProxyContract = meaninglessAddress,
    stabilityFundContract = meaninglessAddress,
    developerFundContract = meaninglessAddress,
  )
  scenario += breakGlass.breakGlass(newContractsParam).run(
    sender = multisigAddress
  )
  
  # THEN the permissions are updated
  scenario.verify(box.data.governorAddress == multisigAddress)
  
  # AND the multisig can update the value.
  multisigValue = sp.nat(5)
  scenario += box.update(multisigValue).run(
    sender = multisigAddress,
  )
  scenario.verify(box.data.value == multisigValue)

  # And the DAO has no perms.
  scenario += breakGlass.runLambda(updateLambda).run(
    sender = daoAddress,
    valid = False,
  )

sp.add_compilation_target("minter-break-glass", MinterBreakGlass())
